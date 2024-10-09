import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Shelter {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  approved: boolean;
}

const AdminManagementScreen: React.FC = () => {
  const [pendingShelters, setPendingShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPendingShelters = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken');
        if (!token) {
          Alert.alert('Error', 'No token found, please log in again.');
          return;
        }

        const response = await axios.get('http://localhost:5001/api/admin/shelters/pending', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPendingShelters(response.data);
      } catch (error) {
        console.error('Error fetching pending shelters:', error);
        Alert.alert('Error', 'Failed to fetch pending shelters');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingShelters();
  }, []);

  const handleApproveShelter = async (shelterId: string) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please log in again.');
        return;
      }

      await axios.post(`http://localhost:5001/api/admin/shelters/approve/${shelterId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPendingShelters(pendingShelters.filter(shelter => shelter._id !== shelterId));
      Alert.alert('Success', 'Shelter approved');
    } catch (error) {
      console.error('Error approving shelter:', error);
      Alert.alert('Error', 'Failed to approve shelter');
    }
  };

  const handleRejectShelter = async (shelterId: string) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please log in again.');
        return;
      }

      await axios.post(`http://localhost:5001/api/admin/shelters/reject/${shelterId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPendingShelters(pendingShelters.filter(shelter => shelter._id !== shelterId));
      Alert.alert('Success', 'Shelter rejected');
    } catch (error) {
      console.error('Error rejecting shelter:', error);
      Alert.alert('Error', 'Failed to reject shelter');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading pending shelters...</Text>
      </View>
    );
  }

  if (pendingShelters.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No pending shelters to approve.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pending Shelters</Text>
      <FlatList
        data={pendingShelters}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.shelterContainer}>
            <Text style={styles.shelterName}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>Latitude: {item.latitude}, Longitude: {item.longitude}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Approve" onPress={() => handleApproveShelter(item._id)} />
              <Button title="Reject" onPress={() => handleRejectShelter(item._id)} color="red" />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  shelterContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  shelterName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default AdminManagementScreen;
