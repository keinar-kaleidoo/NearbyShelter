import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface Props {
  navigation: any;
  setIsAdminLoggedIn: (loggedIn: boolean) => void;
}

const AdminLoginScreen: React.FC<Props> = ({ navigation, setIsAdminLoggedIn }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/admin/login', {
        username: email,
        password: password,
      });

      const { token } = response.data;
      if (token) {
        await AsyncStorage.setItem('adminToken', token);
        setIsAdminLoggedIn(true);
        navigation.navigate('AdminManagement');
      }
    } catch (error) {
      Alert.alert(t('login_failed'), t('check_credentials'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('admin_login')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('email_placeholder')}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t('password_placeholder')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={t('login_button')} onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});

export default AdminLoginScreen;