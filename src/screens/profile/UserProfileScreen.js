import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // <--- Import Image Picker

import colors from '../../constants/colours';
import { UserContext } from '../../context/UserContext';
import { API_BASE_URL } from '../../constants/config';
import TermsModal from '../../components/TermsModal';
import HelpModal from '../../components/HelpModal';

export default function UserProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useContext(UserContext);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Specific loading state for photo upload
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Modals
  const [showTerms, setShowTerms] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [tempData, setTempData] = useState({
    name: '',
    height: '',
    photo: null, // This will store the S3 URL after upload
  });

  const startEditing = () => {
    setTempData({
      name: user?.name || '',
      height: user?.height ? String(user.height) : '', 
      photo: user?.profilePicUrl || null,
    });
    setIsEditing(true);
  };

  // --- CORE: 2-STEP S3 UPLOAD LOGIC ---
  const uploadImageToS3 = async (localUri) => {
    setIsUploadingPhoto(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      // 1. GET PRESIGNED URL
      // We assume the image is jpeg for simplicity, or extract extension from uri
      const typeResponse = await fetch(`${API_BASE_URL}/users/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fileType: 'image/jpeg' }) 
      });

      const { uploadUrl, fileUrl } = await typeResponse.json();
      
      if (!uploadUrl) throw new Error("Failed to get upload URL");

      // 2. UPLOAD BINARY TO S3 DIRECTLY
      // Convert URI to Blob
      const imgResponse = await fetch(localUri);
      const blob = await imgResponse.blob();

      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/jpeg', // Must match what we sent in Step 1
        }
      });

      if (s3Response.status !== 200) throw new Error("Failed to upload to S3");

      // Success! Update local state with the new remote URL
      setTempData(prev => ({ ...prev, photo: fileUrl }));
      
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", "Could not upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoPick = async () => {
    if (!isEditing) return;

    // 1. Request Permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need access to your gallery to change your photo.");
      return;
    }

    // 2. Pick Image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // 3. Trigger Upload immediately
      uploadImageToS3(result.assets[0].uri);
    }
  };
  // ------------------------------------

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      // STEP 2 (Database Update): Send the S3 URL (profilePicUrl) to backend
      const payload = {
        name: tempData.name,
        height: parseInt(tempData.height) || 0,
        // If we uploaded a new photo, tempData.photo contains the new S3 link
        profilePicUrl: tempData.photo 
      };

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        await refreshUser(); 
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        throw new Error(data.message || "Failed to update.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Profile' : 'My Profile'}</Text>

        <TouchableOpacity 
          onPress={isEditing ? handleSave : startEditing}
          disabled={isSaving || isUploadingPhoto} // Disable save while uploading photo
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.editButtonText, isUploadingPhoto && { opacity: 0.5 }]}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Photo Section */}
        <View style={styles.photoContainer}>
          <TouchableOpacity 
            onPress={handlePhotoPick}
            activeOpacity={isEditing ? 0.7 : 1}
            style={styles.photoWrapper}
            disabled={!isEditing || isUploadingPhoto}
          >
            {/* Show Spinner if Uploading */}
            {isUploadingPhoto ? (
               <View style={[styles.profileImage, styles.loadingOverlay]}>
                  <ActivityIndicator color={colors.primary} size="large" />
               </View>
            ) : (
              (isEditing ? tempData.photo : user?.profilePicUrl) ? (
                <Image 
                  source={{ uri: isEditing ? tempData.photo : user.profilePicUrl }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="person" size={48} color={colors.textSecondary} />
                </View>
              )
            )}

            {isEditing && !isUploadingPhoto && (
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
          {isEditing && <Text style={styles.changePhotoText}>Tap to change photo</Text>}
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <ProfileField 
            label="Full Name" 
            value={isEditing ? tempData.name : user?.name} 
            editable={isEditing}
            onChange={(text) => setTempData({...tempData, name: text})}
          />
          
          <View style={styles.row}>
            <ProfileField 
              label="Height (cm)" 
              value={isEditing ? tempData.height : (user?.height ? String(user.height) : '')} 
              editable={isEditing}
              style={{ flex: 1, marginRight: 10 }}
              onChange={(text) => setTempData({...tempData, height: text})}
              keyboardType="numeric"
            />
            <ProfileField 
              label="Age" 
              value={user?.age ? String(user.age) : ''} 
              editable={false}
              style={{ flex: 1 }}
              isLocked={true}
            />
          </View>

          <ProfileField 
            label="Phone Number" 
            value={user?.phoneNumber} 
            editable={false}
            isLocked={true}
          />
        </View>

        {/* Menu Section */}
        {!isEditing && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionHeader}>Settings</Text>
            <MenuOption icon="help-buoy" label="Help & Support" onPress={() => setShowHelp(true)} />
            <MenuOption icon="document-text" label="Terms & Conditions" onPress={() => setShowTerms(true)} />
            <MenuOption icon="log-out" label="Log Out" color="#ef4444" onPress={handleLogout} />
          </View>
        )}

        {isEditing && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelText}>Cancel Changes</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Modals */}
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />

    </KeyboardAvoidingView>
  );
}

// --- HELPER COMPONENTS (Keep same as before) ---
const ProfileField = ({ label, value, editable, onChange, style, isLocked, keyboardType }) => (
  <View style={[styles.fieldContainer, style]}>
    <Text style={styles.label}>{label}</Text>
    {editable && !isLocked ? (
      <TextInput 
        style={styles.input} 
        value={value} 
        onChangeText={onChange}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType || 'default'}
      />
    ) : (
      <View style={[styles.readOnlyBox, isLocked && styles.lockedBox]}>
        <Text style={[styles.readOnlyText, isLocked && styles.lockedText]}>{value || '-'}</Text>
        {isLocked && <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />}
      </View>
    )}
  </View>
);

const MenuOption = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: color ? 'rgba(239, 68, 68, 0.1)' : colors.surface }]}>
        <Ionicons name={icon} size={20} color={color || colors.white} />
    </View>
    <Text style={[styles.optionText, color && { color }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{marginLeft: 'auto'}}/>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  editButtonText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  iconButton: { padding: 4 },
  scrollContent: { padding: 24 },
  
  // Photo Styles Updated for Loader
  photoContainer: { alignItems: 'center', marginBottom: 30 },
  photoWrapper: { position: 'relative' },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.primary },
  loadingOverlay: { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  
  placeholderImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.surface },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  changePhotoText: { color: colors.primary, fontSize: 14, marginTop: 10 },
  
  // ... rest of styles same as before
  formSection: { marginBottom: 30 },
  row: { flexDirection: 'row' },
  fieldContainer: { marginBottom: 20 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.surface,
    color: colors.white,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.primary, 
  },
  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  readOnlyText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  lockedBox: { opacity: 0.7, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  lockedText: { color: colors.textSecondary },
  menuSection: { marginTop: 10 },
  sectionHeader: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', marginBottom: 16 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, marginBottom: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  optionText: { color: colors.white, fontSize: 16, fontWeight: '500' },
  cancelButton: { alignItems: 'center', padding: 16, marginTop: 10 },
  cancelText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});