import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserContext } from '../../context/UserContext'; 
import colors from '../../constants/colours'; 
import { handlePayment } from '../../services/PaymentService'; // Import the service

export default function WalletScreen({ navigation }) {
  const { user, refreshUser, setUser,  loading: contextLoading, token } = useContext(UserContext); 
  const [refreshing, setRefreshing] = useState(false);
  
  // Payment State
  const [modalVisible, setModalVisible] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  // --- Payment Logic ---
  const initiatePayment = async () => {
    const amountVal = parseInt(addAmount);
    if (!addAmount || isNaN(amountVal) || amountVal < 1) {
      Alert.alert("Invalid Amount", "Please enter a valid amount (min ₹1)");
      return;
    }

    setPaymentLoading(true);

    try {
      await refreshUser();
      // Prepare user info for prefill
      const userInfo = {
        email: user?.email,
        phone: user?.phone, // or user?.phoneNumber depending on your schema
        name: user?.name
      };

      // Call Service
      const result = await handlePayment(amountVal, token, userInfo);

      if (result.success || result.status === 'captured') {
        Alert.alert("Success", "Funds added successfully!");
        const currentBalance = Number(user.walletBalance) || 0; 
        const amountAdded = Number(addAmount); 
        const newBalance = currentBalance + amountAdded;

        // 3. Manually update the Context IMMEDIATELY
        setUser({
            ...user,                  // Keep all other user info (name, email, role)
           walletBalance: newBalance // Overwrite just the balance
        });
      }
    } catch (error) {
      if (!error.isCancel) {
        Alert.alert("Payment Failed", error.message);
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  // Mock Transactions (You can replace this with real data from user.transactions later)
  const [transactions] = useState([
    { id: '1', title: 'Added Funds', date: 'Today, 10:30 AM', amount: '+ ₹500', type: 'credit' },
    { id: '2', title: 'Club Onyx Entry', date: 'Yesterday, 11:00 PM', amount: '- ₹2,500', type: 'debit' },
  ]);

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.iconBox}>
        <Ionicons 
          name={item.type === 'credit' ? "arrow-down" : "arrow-up"} 
          size={20} 
          color={item.type === 'credit' ? "#4ade80" : colors.textSecondary} 
        />
      </View>
      <View style={styles.transDetails}>
        <Text style={styles.transTitle}>{item.title}</Text>
        <Text style={styles.transDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.transAmount, 
        { color: item.type === 'credit' ? "#4ade80" : colors.white }
      ]}>
        {item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={() => (
          <View style={styles.balanceSection}>
            {/* BALANCE CARD */}
            <View style={styles.card}>
              <View>
                <Text style={styles.cardLabel}>Total Balance</Text>
                {contextLoading ? (
                  <ActivityIndicator color={colors.white} style={{alignSelf:'flex-start', marginTop: 10}}/>
                ) : (
                  <Text style={styles.cardBalance}>₹ {user?.walletBalance?.toLocaleString() || '0'}</Text>
                )}
              </View>
              <View style={styles.logoContainer}>
                <Ionicons name="wallet" size={40} color="rgba(255,255,255,0.2)" />
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionsRow}>
              
              {/* Add Money Button */}
              <TouchableOpacity 
                style={styles.actionBtn} 
                activeOpacity={0.8}
                onPress={() => setModalVisible(true)} // Open Modal
              >
                <View style={styles.actionIcon}>
                  <Ionicons name="add" size={24} color={colors.white} />
                </View>
                <Text style={styles.actionText}>Add Money</Text>
              </TouchableOpacity>

              {/* Withdraw Button (Placeholder) */}
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Ionicons name="arrow-down" size={24} color={colors.white} />
                </View>
                <Text style={styles.actionText}>Withdraw</Text>
              </TouchableOpacity>

            </View>

            <Text style={styles.sectionHeader}>Recent Transactions</Text>
          </View>
        )}
      />

      {/* --- ADD MONEY MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Funds</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Enter Amount</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={addAmount}
                onChangeText={setAddAmount}
                autoFocus={true}
              />
            </View>

            {/* Quick Select Chips */}
            <View style={styles.chipRow}>
              {[100, 500, 1000].map((amt) => (
                <TouchableOpacity 
                  key={amt} 
                  style={styles.chip} 
                  onPress={() => setAddAmount(amt.toString())}
                >
                  <Text style={styles.chipText}>+₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.payButton, paymentLoading && { opacity: 0.7 }]}
              onPress={initiatePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.payButtonText}>Proceed to Pay</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.white, marginLeft: 20 },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  // Balance Card
  balanceSection: { marginBottom: 20 },
  card: { backgroundColor: colors.primary, borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  cardBalance: { color: colors.white, fontSize: 36, fontWeight: '800' },
  logoContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },

  // Actions
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, flex: 0.48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionText: { color: colors.white, fontWeight: '600', fontSize: 14 },

  // Transactions
  sectionHeader: { color: colors.textSecondary, fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  transDetails: { flex: 1 },
  transTitle: { color: colors.white, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  transDate: { color: colors.textSecondary, fontSize: 12 },
  transAmount: { fontSize: 16, fontWeight: 'bold' },

  // --- Modal Styles ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  inputLabel: { color: colors.textSecondary, marginBottom: 10, fontSize: 14 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.primary, paddingBottom: 10, marginBottom: 20 },
  currencySymbol: { color: colors.white, fontSize: 32, fontWeight: 'bold', marginRight: 10 },
  amountInput: { flex: 1, color: colors.white, fontSize: 32, fontWeight: 'bold' },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  chip: { backgroundColor: colors.surface, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chipText: { color: colors.white, fontWeight: '600' },
  payButton: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  payButtonText: { color: colors.white, fontSize: 18, fontWeight: 'bold' }
});