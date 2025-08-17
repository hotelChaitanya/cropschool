import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface Props {
  navigation: any;
}

interface Plot {
  id: number;
  planted: boolean;
  crop: string;
  growth: number;
}

const GameScreen: React.FC<Props> = ({ navigation }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Farm</Text>
        <Text style={styles.coins}>💰 {coins} coins</Text>
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
              <Text style={styles.growthText}>Growing... {plot.growth}/3</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2F4F2F',
  },
  coins: {
    fontSize: 20,
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

export default GameScreen;
