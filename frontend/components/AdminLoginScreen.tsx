import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, I18nManager, TouchableOpacity } from 'react-native';
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
  const [showPassword, setShowPassword] = useState(false);

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
        style={[styles.input, { backgroundColor: 'white', textAlign: isRTL ? 'right' : 'left' }]}
        placeholder={t('email_placeholder')}
        placeholderTextColor={'black'}
        value={email}
        onChangeText={setEmail}
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder={t('password_placeholder')}
          placeholderTextColor={'black'}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
      <TouchableOpacity 
        onPress={() => setShowPassword(!showPassword)} 
        style={[styles.toggleTextContainer, isRTL ? { right: 0 } : { left: 0 }]}>
        <Text style={styles.toggleText}>
          {showPassword ? t('hide_password') : t('show_password')}
        </Text>
      </TouchableOpacity>
      </View>
      
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
    color: 'black',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 5,
    padding: 8,
    borderRadius: 5,
    color: 'black',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  toggleTextContainer: {
    padding: 8,
    position: 'absolute'
  },
  toggleText: {
    fontSize: 14,
    color: 'blue',
  },
});

export default AdminLoginScreen;