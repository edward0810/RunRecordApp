// RunningTrackerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Button } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
const RunningTrackerScreen = () => {
    const [route, setRoute] = useState([]);
    const [isTracking, setIsTracking] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);
    const [locationSubscription, setLocationSubscription] = useState(null);
    const [newRecord, setNewRecord] = useState(null);
    const [speed, setSpeed] = useState(null);
    const navigation = useNavigation();
    // 开始追踪
    const startTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }


        // 重置相关状态以清除上一次的记录和速度
        setRoute([]); // 清除地图上的路径
        setSpeed(null); // 重置速度数据
        setNewRecord(null);
        setIsTracking(true);
        setStartTime(new Date());
        setElapsedTime(0);
        timerRef.current = setInterval(() => {
            setElapsedTime(previousTime => previousTime + 1);
        }, 1000); // 每秒更新时间

        const subscription = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.High,
            distanceInterval: 0.5,
        }, (location) => {
            setCurrentPosition({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
            setRoute(currentRoute => [...currentRoute, {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }]);
        });

        setLocationSubscription(subscription);
    };

    // 停止追踪
    const stopTracking = () => {
        if (locationSubscription) {
            locationSubscription.remove();
            setLocationSubscription(null);
        }
        setIsTracking(false);
        clearInterval(timerRef.current); // 停止计时器
        const endTime = new Date();
        const timeDiff = (endTime - startTime) / 1000; // 秒

        let distance = 0; // 计算距离
        for (let i = 1; i < route.length; i++) {
            distance += calculateDistance(route[i - 1].latitude, route[i - 1].longitude, route[i].latitude, route[i].longitude);
        }

        const calculatedSpeed = distance / timeDiff; // 计算速度
        setSpeed(calculatedSpeed); // 更新速度状态

        const record = { // 创建新记录
            distance,
            time: timeDiff,
            speed: calculatedSpeed,
            date: new Date().toISOString(),
            route,
        };
        setNewRecord(record); // 更新新记录状态
    };


    // 存储记录的函数
    const storeRecord = async () => {
        if (!newRecord) return; // 如果没有新记录，则直接返回

        try {
            const jsonValue = JSON.stringify(newRecord);
            await AsyncStorage.setItem(`@fitness_record:${Date.now()}`, jsonValue);
            setNewRecord(null); // 清除记录状态
        } catch (e) {
            console.error('Error saving data', e);
        }
    };

    // 根据坐标计算两点之间的距离，返回米
    function calculateDistance(lat1, lon1, lat2, lon2) {
        // 地球半径，单位米
        var R = 6371000;
        var dLat = ((lat2 - lat1) * Math.PI) / 180;
        var dLon = ((lon2 - lon1) * Math.PI) / 180;
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    };

    // 格式化显示时间
    const formatTime = (totalSeconds) => {
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
          <MapView
            style={StyleSheet.absoluteFill}
            showsUserLocation={true}
            region={currentPosition}
          >
            <Polyline coordinates={route} strokeWidth={2} strokeColor="red" />
          </MapView>
    
          <View style={styles.textContainer}>
            <Text style={styles.highlightedText}>Time: {formatTime(elapsedTime)}</Text>
            {speed !== null && <Text style={styles.highlightedText}>Speed: {(speed * 3.6).toFixed(2)} km/h</Text>}
          </View>
    
          <View style={styles.buttonsContainer}>
            {isTracking ? (
              <TouchableOpacity style={styles.button} onPress={stopTracking}>
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.button} onPress={startTracking}>
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
            )}
    
            {newRecord && (
              <TouchableOpacity style={styles.button} onPress={() => {
                navigation.navigate('Add Record', { newRecord });
              }}>
                <Text style={styles.buttonText}>Post</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      textContainer: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1, 
      },
      highlightedText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: 'bold',
        margin: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        padding: 5,
        borderRadius: 5,
      },
      buttonsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        zIndex: 1,
      },
      button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
      },
      buttonText: {
        color: '#ffffff',
        fontSize: 16,
        textAlign: 'center',
      },
});

export default RunningTrackerScreen;
