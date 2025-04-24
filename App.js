import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, useColorScheme
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const API_URL = 'https://todo-fastapi-fm3h.onrender.com/api/tasks/';

export default function App() {
  const systemTheme = useColorScheme();
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [editId, setEditId] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(systemTheme === 'dark');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async () => {
    if (!task.trim()) return;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task, completed: false }),
      });
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setTask('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const removeTask = async (id) => {
    try {
      await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleComplete = async (id, completed) => {
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskToUpdate.title,
          completed: !completed,
        }),
      });
      const updatedTask = await response.json();
      setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const saveEdit = async (id) => {
    if (!editedTask.trim()) return;
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTask }),
      });
      const updatedTask = await response.json();
      setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
      setEditId(null);
      setEditedTask('');
    } catch (error) {
      console.error('Error editing task:', error);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return true;
  });

  const styles = createStyles(darkMode);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>To-Do List</Text>
      <TouchableOpacity style={styles.themeToggle} onPress={() => setDarkMode(!darkMode)}>
        <Icon
          name={darkMode ? 'moon' : 'sun'}
          size={20}
          color={darkMode ? '#000' : '#fff'}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.text, { fontWeight: 'bold' }]}> {darkMode ? 'Dark' : 'Light'} Mode </Text>
      </TouchableOpacity>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          placeholderTextColor={darkMode ? '#aaa' : '#666'}
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.button} onPress={addTask}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {['all', 'completed', 'pending'].map((type) => (
          <TouchableOpacity key={type} onPress={() => setFilter(type)} style={styles.filterButton}>
            <Text style={[styles.text, filter === type && styles.activeFilter]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.taskItem, item.completed && styles.completed]}>
            <TouchableOpacity onPress={() => toggleComplete(item.id, item.completed)}>
              <Icon
                name={item.completed ? 'check-circle' : 'circle'}
                size={20}
                color={item.completed ? '#888888' : '#555555'}
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
            {editId === item.id ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={editedTask}
                  onChangeText={setEditedTask}
                />
                <TouchableOpacity style={styles.button} onPress={() => saveEdit(item.id)}>
                  <Text style={styles.buttonText}>SAVE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { marginLeft: 8 }]} onPress={() => setEditId(null)}>
                  <Text style={styles.buttonText}>CANCEL</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.text, styles.taskText]}>{item.title}</Text>
                <TouchableOpacity style={styles.button} onPress={() => {
                  setEditId(item.id);
                  setEditedTask(item.title);
                }}>
                  <Text style={styles.buttonText}>EDIT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { marginLeft: 8 }]} onPress={() => removeTask(item.id)}>
                  <Text style={styles.buttonText}>DELETE</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const createStyles = (darkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      paddingHorizontal: 20,
      backgroundColor: darkMode ? '#121212' : '#f0f0f0',
    },
    heading: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 20,
      color: darkMode ? '#fff' : '#222',
      textAlign: 'center',
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 16,
      backgroundColor: darkMode ? '#222' : '#ccc',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },

    inputRow: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    input: {
      flex: 1,
      padding: 10,
      backgroundColor: darkMode ? '#2e2e2e' : '#fff',
      color: darkMode ? '#fff' : '#000',
      borderColor: darkMode ? '#444' : '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      marginRight: 10,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 15,
      marginVertical: 6,
      backgroundColor: darkMode ? '#333' : '#fff',
      borderRadius: 10,
      boxShadowColor: '#000',
      boxShadowOpacity: 0.1,
      boxShadowOffset: { width: 0, height: 2 },
      boxShadowRadius: 4,
      elevation: 3,

    },
    taskText: {
      flex: 1,
      marginHorizontal: 10,
      color: darkMode ? '#fff' : '#000',
      fontSize: 16,
    },
    editInput: {
      flex: 1,
      padding: 8,
      borderWidth: 1,
      borderColor: darkMode ? '#777' : '#ccc',
      backgroundColor: darkMode ? '#444' : '#fff',
      color: darkMode ? '#fff' : '#000',
      borderRadius: 6,
      marginRight: 10,
    },
    completed: {
      opacity: 0.6,
    },
    filters: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
    },
    filterButton: {
      marginHorizontal: 6,
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: darkMode ? '#555' : '#007bff',
    },
    activeFilter: {
      fontWeight: 'bold',
      textDecorationLine: 'underline',
      color: darkMode ? '#fff' : '#fff',
    },
    text: {
      color: darkMode ? '#fff' : '#222',
    },
    button: {
      backgroundColor: darkMode ? '#555' : '#007bff',
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 8,
      marginTop: 4,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
  });
