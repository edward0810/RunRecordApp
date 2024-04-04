// 在 AddRecord.js 中
import React, { useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Image, View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddRecord = ({ route, navigation }) => {
  // 状态来存储文本输入、位置、照片和新记录的数据
  const [text, setText] = useState('');
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [image, setImage] = useState(null);

  // 检查 route.params 是否存在，并且 newRecord 是否在其中
  const newRecord = route.params ? route.params.newRecord : {
    time: '',
    speed: '',
    distance: '',
  };
  // // 获取地理位置
  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.error('Permission to access location was denied');
  //       return;
  //     }

  //     let currentLocation = await Location.getCurrentPositionAsync({});
  //     setLocation(currentLocation);
  //   })();
  // }, []);

  // 获取地理位置
  const getLocationHandler = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant location permissions to use this feature.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  //请求相机权限
  const verifyPermissions = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.status !== 'granted') {
      Alert.alert(
        'Insufficient permissions!',
        'You need to grant camera permissions to use this app.',
        [{ text: 'Okay' }]
      );
      return false;
    }
    return true;
  };


  // 调用相机的函数
  const takeImageHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }

    let cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    console.log('Image capture result:', cameraResult);

    // 确保有结果并且没有取消操作
    if (!cameraResult.cancelled && cameraResult.assets) {
      setImage(cameraResult.assets[0].uri);
      console.log('Image captured, uri:', cameraResult.assets[0].uri);
    } else {
      console.log('Image capture was cancelled or failed');
    }
  };

  // 处理添加图片
  const handleAddPhoto = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) {
      return;
    }

    // 安全地打开图片库
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });


    if (!result.cancelled && result.assets) {
      setImage(result.assets[0].uri);
      console.log('Image selected, imageUri:', result.assets[0].uri);
    } else if (!result.cancelled) {
      setImage(result.uri);
      console.log('Image selected, uri:', result.uri);
    }
  };


  // 处理发布帖子
  const handlePost = async () => {
    const newPost = {
      id: Date.now().toString(), // 为每个帖子生成唯一ID
      text,
      location,
      photo: image,
      record: newRecord,
    };

    try {
      const existingPosts = JSON.parse(await AsyncStorage.getItem('posts')) || [];
      const updatedPosts = [...existingPosts, newPost];
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
      navigation.navigate('View Records');
      // 清空表单和图片
      resetForm();
    } catch (err) {
      console.error('Error saving the post', err);
      Alert.alert('Error', 'Failed to save the post.');
    }
  };
  const resetForm = () => {
    setText('');
    setLocation(null);
    setImage(null);

  };
  return (
    <View style={styles.container}>
      <Text>Time: {newRecord.time || "No data"}</Text>
      <Text>Speed: {newRecord.speed || "No data"}</Text>
      <Text>Distance: {newRecord.distance || "No data"}</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Keep track of your runs"
        style={styles.input}
      />
      {image && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}
      {location && (
        <Text>Location: {location.coords ? `${location.coords.latitude}, ${location.coords.longitude}` : 'No location'}</Text>
      )}
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={takeImageHandler} style={styles.iconButton}>
          <FontAwesome name="camera" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddPhoto} style={styles.iconButton}>
          <FontAwesome name="image" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={getLocationHandler} style={styles.iconButton}>
          <FontAwesome name="map-marker" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePost} style={styles.iconButton}>
          <FontAwesome name="send" size={24} color="black" />
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  iconButton: {

    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 20,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  iconButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddRecord;
