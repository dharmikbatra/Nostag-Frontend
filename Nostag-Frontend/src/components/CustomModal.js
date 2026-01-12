import React from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colours'; 

/**
 * A reusable bottom-sheet style modal.
 * * @param {boolean} visible - Controls if modal is open.
 * @param {function} onClose - Function to call when closing (clicking overlay or X).
 * @param {string} title - (Optional) Title text at the top.
 * @param {React.Node} children - The content inside the modal.
 */


export default function CustomModal({ visible, onClose, title, children }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Handles Android hardware back button
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* Prevent clicks inside the modal from closing it */}
        <TouchableWithoutFeedback>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.header}>
              {title ? <Text style={styles.title}>{title}</Text> : <View />} 
              
              <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View>
              {children}
            </View>

          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

// Import Text here to avoid circular dependency issues if you put styles above
import { Text } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // Dark semi-transparent background
    justifyContent: 'flex-end', // Aligns modal to the bottom
  },
  modalContent: {
    backgroundColor: '#1e293b', // Lighter slate than background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40, // Extra padding for safe area
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
});