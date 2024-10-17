import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, FlatList, StyleSheet, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '@env';
import i18n from '../i18n';

interface Shelter {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  approved: boolean;
}

const AdminManagementScreen: React.FC = () => {
  const { t } = useTranslation();
  const [pendingShelters, setPendingShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const currentLanguage = i18n.language;
    const isLanguageRTL = currentLanguage === 'he';
    setIsRTL(isLanguageRTL);
  }, [i18n.language]);

  useEffect(() => {
    const fetchPendingShelters = async () => {
      try {
        const token = await AsyncStorage.getItem('adminToken');
        if (!token) {
          Alert.alert(t('error'), t('no_token_error'));
          return;
        }

        const response = await axios.get(`${API_URL}/api/admin/shelters/pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPendingShelters(response.data);
      } catch (error) {
        console.error('Error fetching pending shelters:', error);
        Alert.alert(t('error'), t('fetch_shelters_error'));
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
        Alert.alert(t('error'), t('no_token_error'));
        return;
      }

      await axios.patch(`${API_URL}/api/admin/shelters/approve/${shelterId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPendingShelters(pendingShelters.filter(shelter => shelter._id !== shelterId));
      Alert.alert(t('success'), t('shelter_approved'));
    } catch (error) {
      console.error('Error approving shelter:', error);
      Alert.alert(t('error'), t('approve_shelter_error'));
    }
  };

  const handleRejectShelter = async (shelterId: string) => {
    try {
      const token = await AsyncStorage.getItem('adminToken');
      if (!token) {
        Alert.alert(t('error'), t('no_token_error'));
        return;
      }

      await axios.delete(`${API_URL}/api/admin/shelters/reject/${shelterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPendingShelters(pendingShelters.filter(shelter => shelter._id !== shelterId));
      Alert.alert(t('success'), t('shelter_rejected'));
    } catch (error) {
      console.error('Error rejecting shelter:', error);
      Alert.alert(t('error'), t('reject_shelter_error'));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>{t('loading_shelters')}</Text>
      </View>
    );
  }

  if (pendingShelters.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[isRTL ? { textAlign: 'left' } : { textAlign: 'right' }]}>{t('no_pending_shelters')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('pending_shelters')}</Text>
      <FlatList
        data={pendingShelters}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.shelterContainer}>
            <Text style={styles.shelterName}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>{t('coordinates', { latitude: item.latitude, longitude: item.longitude })}</Text>
            <View style={styles.buttonContainer}>
              <Button title={t('approve_button')} onPress={() => handleApproveShelter(item._id)} />
              <Button title={t('reject_button')} onPress={() => handleRejectShelter(item._id)} color="red" />
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
    color: "black"
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: "black",
  },
  shelterContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    borderRadius: 5,
    color: "black",
  },
  shelterName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: "black",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default AdminManagementScreen;
