import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomModal from './CustomModal';
import colors from '../constants/colours';

export default function HelpModal({ visible, onClose }) {
  
  const handleEmail = () => {
    Linking.openURL('mailto:support@nostag.com');
  };

  const handleCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Help & Support"
    >
      <View style={styles.container}>
        <Text style={styles.description}>
          Facing issues with a booking or account? Reach out to our support team.
          We will resolve your query as soon as possible.
        </Text>

        {/* Email Option */}
        <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
          <View style={styles.iconBox}>
            <Ionicons name="mail" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.label}>Email Us</Text>
            <Text style={styles.value}>support@nostag.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{marginLeft: 'auto'}} />
        </TouchableOpacity>

        {/* Phone Option */}
        <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
          <View style={styles.iconBox}>
            <Ionicons name="call" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.label}>WhatsApp Number</Text>
            <Text style={styles.value}>+91 98765 43210</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} style={{marginLeft: 'auto'}} />
        </TouchableOpacity>

      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Light indigo bg
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});