import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CropSchool</Text>
      <Text style={styles.subtitle}>
        Learn agriculture through interactive gaming
      </Text>

      <View style={styles.featuresContainer}>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🌱 Plant & Grow</Text>
          <Text style={styles.featureDescription}>
            Start your farming journey by planting various crops and watching
            them grow.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🎯 Complete Quests</Text>
          <Text style={styles.featureDescription}>
            Take on exciting challenges and learn agricultural best practices.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>🏆 Earn Achievements</Text>
          <Text style={styles.featureDescription}>
            Unlock rewards and showcase your farming expertise.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.playButtonText}>Play Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  playButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
