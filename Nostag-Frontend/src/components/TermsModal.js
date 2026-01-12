import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CustomModal from './CustomModal';
import colors from '../constants/colours';

export default function TermsModal({ visible, onClose }) {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Terms & Guidelines"
    >
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle="white"
        >
          <Text style={styles.sectionTitle}>1. Age Requirement</Text>
          <Text style={styles.text}>
            You must be at least 18 years of age to use NoStag for booking tables or joining guestlists. A valid government-issued ID (Passport, Driver's License, or Aadhar Card) is mandatory for entry at all partner venues.
          </Text>

          <Text style={styles.sectionTitle}>2. Right to Admission</Text>
          <Text style={styles.text}>
            Admission is subject to the venue's discretion. NoStag guarantees your booking, but the venue reserves the right to refuse entry for dress code violations, intoxication, or behavioral issues. In such cases, booking fees are non-refundable.
          </Text>

          <Text style={styles.sectionTitle}>3. Code of Conduct</Text>
          <Text style={styles.text}>
            We maintain a strict zero-tolerance policy towards harassment. Any user reported for misconduct, aggression, or inappropriate behavior at a venue will be permanently banned from the app.
          </Text>

          <Text style={styles.sectionTitle}>4. Cancellations & Refunds</Text>
          <Text style={styles.text}>
            • Cancellations made 24 hours prior to the event are eligible for a 50% refund.
            {'\n'}• Same-day cancellations are non-refundable.
            {'\n'}• Convenience fees are never refundable.
          </Text>

          <Text style={styles.sectionTitle}>5. Data Privacy</Text>
          <Text style={styles.text}>
            Your phone number and verification details are securely stored and shared only with the venue for entry verification purposes. We do not sell your data to third parties.
          </Text>

          {/* Extra space at bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400, // Fixed height for the text area
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingRight: 10,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
});