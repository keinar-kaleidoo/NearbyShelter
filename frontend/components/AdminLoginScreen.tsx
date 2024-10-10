import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '@env';
import i18n from '../i18n';

interface Props {
  navigation: any;
  setIsAdminLoggedIn: (loggedIn: boolean) => void;
}

const AdminLoginScreen: React.FC<Props> = ({ navigation, setIsAdminLoggedIn }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const currentLanguage = i18n.language;
    const isLanguageRTL = currentLanguage === 'he';
    setIsRTL(isLanguageRTL);
  }, [i18n.language]);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        username: email,
        password: password,
      });

      const { token } = response.data;
      if (token) {
        await AsyncStorage.setItem('adminToken', token);
        setIsAdminLoggedIn(true);
        navigation.navigate(t('admin_management'));
      }
    } catch (error) {
      Alert.alert(t('login_failed'), t('check_credentials'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('admin_login')}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: 'white' , textAlign: isRTL ? 'right' : 'left' }]}
        placeholder={t('email_placeholder')}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
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
    marginBottom: 5,
    padding: 8,
    borderRadius: 5,
  },
});

export default AdminLoginScreen;