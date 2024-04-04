import React, { useState, useCallback} from 'react';
import { View, Text, FlatList, Image, Button, StyleSheet, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
const ViewRecords = () => {
  const [posts, setPosts] = useState([]);
  const [editPostId, setEditPostId] = useState(null);
  const [editedText, setEditedText] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchPosts = async () => {
        try {
          const storedPosts = JSON.parse(await AsyncStorage.getItem('posts')) || [];
          setPosts(storedPosts);
        } catch (err) {
          console.error('Failed to fetch posts', err);
        }
      };

      fetchPosts();
     
    }, []) 
  );

  const deletePost = async (id) => {
    const updatedPosts = posts.filter(post => post.id !== id);
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts); // 更新本地状态
  };

  // 修改帖子
  const startEditPost = (post) => {
    setEditPostId(post.id);
    setEditedText(post.text);
  };

  const cancelEditPost = () => {
    setEditPostId(null);
    setEditedText('');
  };

  const saveEditPost = async () => {
    const updatedPosts = posts.map((post) => {
      if (post.id === editPostId) {
        return { ...post, text: editedText };
      }
      return post;
    });
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    setEditPostId(null);
    setEditedText('');
  };



  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.postItem}>
            <Text>Time: {item.record.time}</Text>
            <Text>Speed: {item.record.speed}</Text>
            <Text>Distance: {item.record.distance}</Text>
            <Text>Location: {item.location ? `${item.location.coords.latitude}, ${item.location.coords.longitude}` : 'No location'}</Text>
            <Image source={{ uri: item.photo }} style={styles.image} />
            {editPostId === item.id ? (
              <>
                <TextInput
                  value={editedText}
                  onChangeText={setEditedText}
                  style={styles.textInput}
                />
                <Button title="Save" onPress={saveEditPost} />
                <Button title="Cancel" onPress={cancelEditPost} />
              </>
            ) : (
              <>
                <Text>{item.text}</Text>
                <Button title="Edit" onPress={() => startEditPost(item)} />
              </>
            )}
            <Button title="Delete" onPress={() => deletePost(item.id)} />
            
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  postItem: {
    // 添加边距、边框等，以确保布局的一致性
    marginBottom: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: '100%', // 图片宽度占满容器宽度
    height: 200, // 例如，高度为200
    resizeMode: 'cover', // 或者 'contain'，根据你的需要
    marginBottom: 10, // 图片与下方内容的间距
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
});

export default ViewRecords;
