import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import api from '../utils/api';

const AdminScreen: React.FC = () => {
  const [pendingShelters, setPendingShelters] = useState([]);

  useEffect(() => {
    fetchPendingShelters();
  }, []);

  const fetchPendingShelters = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/admin/shelters/pending', {
        headers: {
          Authorization: `Bearer YOUR_ADMIN_TOKEN`, // יש להחליף בטוקן המנהל
        },
      });
      setPendingShelters(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pending shelters');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`http://localhost:5001/api/admin/shelters/approve/${id}`, {}, {
        headers: {
          Authorization: `Bearer YOUR_ADMIN_TOKEN`,
        },
      });
      Alert.alert('Success', 'Shelter approved');
      fetchPendingShelters();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve shelter');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`http://localhost:5001/api/admin/shelters/reject/${id}`, {}, {
        headers: {
          Authorization: `Bearer YOUR_ADMIN_TOKEN`,
        },
      });
      Alert.alert('Success', 'Shelter rejected');
      fetchPendingShelters();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject shelter');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Shelters</Text>
      <FlatList
        data={pendingShelters}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.shelterContainer}>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Approve" onPress={() => handleApprove(item._id)} />
              <Button title="Reject" onPress={() => handleReject(item._id)} />
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shelterContainer: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default AdminScreen;
