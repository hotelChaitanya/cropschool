import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface Plot {
  id: number;
  planted: boolean;
  crop: string;
  growth: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game'>('home');
  const [plots, setPlots] = useState<Plot[]>(
    Array.from({ length: 9 }, (_, index) => ({
      id: index + 1,
      planted: false,
      crop: '',
      growth: 0,
    }))
  );
  const [coins, setCoins] = useState(100);
  const [selectedCrop, setSelectedCrop] = useState('🌱');

  const crops = [
    { emoji: '🌱', name: 'Wheat', cost: 10, value: 20 },
    { emoji: '🌽', name: 'Corn', cost: 15, value: 30 },
    { emoji: '🥕', name: 'Carrot', cost: 20, value: 40 },
    { emoji: '🍅', name: 'Tomato', cost: 25, value: 50 },
  ];

  const plantCrop = (plotId: number) => {
    const cropData = crops.find(c => c.emoji === selectedCrop);
    if (!cropData) return;

    if (coins < cropData.cost) {
      Alert.alert(
        'Not enough coins!',
        `You need ${cropData.cost} coins to plant ${cropData.name}`
      );
      return;
    }

    setPlots(prev =>
      prev.map(plot =>
        plot.id === plotId
          ? { ...plot, planted: true, crop: selectedCrop, growth: 1 }
          : plot
      )
    );
    setCoins(prev => prev - cropData.cost);
  };

  const harvestCrop = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || plot.growth < 3) return;

    const cropData = crops.find(c => c.emoji === plot.crop);
    if (!cropData) return;

    setPlots(prev =>
      prev.map(p =>
        p.id === plotId ? { ...p, planted: false, crop: '', growth: 0 } : p
      )
    );
    setCoins(prev => prev + cropData.value);
    Alert.alert('Harvested!', `You earned ${cropData.value} coins!`);
  };

  const growCrops = () => {
    setPlots(prev =>
      prev.map(plot =>
        plot.planted && plot.growth < 3
          ? { ...plot, growth: plot.growth + 1 }
          : plot
      )
    );
  };

  const getPlotDisplay = (plot: Plot) => {
    if (!plot.planted) return '🟫';
    if (plot.growth === 1) return '🌱';
    if (plot.growth === 2) return plot.crop;
    return `✨${plot.crop}✨`; // Ready to harvest
  };

  if (currentScreen === 'home') {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Welcome to CropSchool</Text>
          <Text style={styles.subtitle}>
            Learn agriculture through interactive gaming
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>🌱 Plant & Grow</Text>
              <Text style={styles.featureDescription}>
                Start your farming journey by planting various crops and
                watching them grow.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>🎯 Complete Quests</Text>
              <Text style={styles.featureDescription}>
                Take on exciting challenges and learn agricultural best
                practices.
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
            onPress={() => setCurrentScreen('game')}
          >
            <Text style={styles.playButtonText}>Start Farming!</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.gameContainer}>
        <View style={styles.gameHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={styles.backButtonText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.gameTitle}>Your Farm</Text>
          <Text style={styles.coins}>💰 {coins}</Text>
        </View>

        <View style={styles.cropSelector}>
          <Text style={styles.selectorTitle}>Select Crop:</Text>
          <View style={styles.cropButtons}>
            {crops.map(crop => (
              <TouchableOpacity
                key={crop.emoji}
                style={[
                  styles.cropButton,
                  selectedCrop === crop.emoji && styles.selectedCrop,
                ]}
                onPress={() => setSelectedCrop(crop.emoji)}
              >
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
                <Text style={styles.cropCost}>{crop.cost}💰</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.farmGrid}>
          {plots.map(plot => (
            <TouchableOpacity
              key={plot.id}
              style={styles.farmPlot}
              onPress={() => {
                if (!plot.planted) {
                  plantCrop(plot.id);
                } else if (plot.growth >= 3) {
                  harvestCrop(plot.id);
                }
              }}
            >
              <Text style={styles.plotEmoji}>{getPlotDisplay(plot)}</Text>
              <Text style={styles.plotNumber}>#{plot.id}</Text>
              {plot.planted && plot.growth < 3 && (
                <Text style={styles.growthText}>
                  Growing... {plot.growth}/3
                </Text>
              )}
              {plot.planted && plot.growth >= 3 && (
                <Text style={styles.harvestText}>Tap to harvest!</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.growButton} onPress={growCrops}>
          <Text style={styles.growButtonText}>🌧️ Water All Crops</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  gameContainer: {
    padding: 20,
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
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F4F2F',
  },
  coins: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  cropSelector: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2F4F2F',
    marginBottom: 10,
  },
  cropButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cropButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCrop: {
    borderColor: '#32CD32',
  },
  cropEmoji: {
    fontSize: 24,
  },
  cropCost: {
    fontSize: 12,
    color: '#666',
  },
  farmGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  farmPlot: {
    width: 100,
    height: 120,
    backgroundColor: '#8FBC8F',
    borderRadius: 8,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#654321',
  },
  plotEmoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  plotNumber: {
    fontSize: 12,
    color: '#2F4F2F',
    fontWeight: 'bold',
  },
  growthText: {
    fontSize: 10,
    color: '#228B22',
    textAlign: 'center',
    marginTop: 5,
  },
  harvestText: {
    fontSize: 10,
    color: '#FF6347',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  growButton: {
    backgroundColor: '#32CD32',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  growButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
