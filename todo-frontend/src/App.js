import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './api';

function App() {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    refreshTasks();
  }, []);

  const refreshTasks = () => {
    getTasks().then(res => setTasks(res.data));
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createTask({ title: newTitle, is_completed: false, parent: null }).then(() => {
      setNewTitle('');
      refreshTasks();
    });
  };

  const handleToggleComplete = (task) => {
    updateTask(task.id, { ...task, is_completed: !task.is_completed })
      .then(() => refreshTasks())
      .catch(err => {
        const message =
          err.response?.data?.non_field_errors?.[0] ||
          "Please complete all subtasks first 🙂";
        alert(message);
      });
  };

  const handleCreateSubtask = (e, parentId) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      createTask({
        title: e.target.value,
        is_completed: false,
        parent: parentId
      }).then(() => {
        e.target.value = '';
        refreshTasks();
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(id).then(() => refreshTasks());
    }
  };

  const renderTitle = (title, isCompleted) => (
    <span style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>{title}</span>
  );

  return (
    <div style={{ padding: '2em', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1>📝 Todo App</h1>

      <div style={{ marginBottom: '1.5em' }}>
        <input
          type="text"
          placeholder="Add new task"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          style={{ padding: '0.5em', width: '70%' }}
        />
        <button onClick={handleCreate} style={{ padding: '0.5em', marginLeft: '0.5em' }}>
          Add
        </button>
      </div>

      {tasks.filter(task => task.parent === null).map(task => (
        <div key={task.id} style={{ marginBottom: '1em', padding: '1em', border: '1px solid #ddd', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {editingId === task.id ? (
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateTask(task.id, { ...task, title: editText })
                      .then(() => {
                        setEditingId(null);
                        refreshTasks();
                      });
                  }
                }}
                onBlur={() => setEditingId(null)}
                autoFocus
                style={{ flexGrow: 1, marginRight: '0.5em' }}
              />
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <input
                  type="checkbox"
                  checked={task.is_completed}
                  onChange={() => handleToggleComplete(task)}
                />
                <strong style={{ textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                  {task.title}
                </strong>
              </label>
            )}

            <div style={{ display: 'flex', gap: '0.5em' }}>
              <button
                onClick={() => {
                  setEditText(task.title);
                  setEditingId(task.id);
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                🗑️
              </button>
            </div>
          </div>

          <ul style={{ paddingLeft: '1.5em', marginTop: '0.5em' }}>
            {tasks
              .filter(subtask => subtask.parent === task.id)
              .map(subtask => (
                <li key={subtask.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                    <input
                      type="checkbox"
                      checked={subtask.is_completed}
                      onChange={() => handleToggleComplete(subtask)}
                    />
                    {renderTitle(subtask.title, subtask.is_completed)}
                  </label>
                  <button onClick={() => handleDelete(subtask.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    🗑️
                  </button>
                </li>
              ))}
          </ul>

          <input
            type="text"
            placeholder="Add subtask"
            onKeyDown={(e) => handleCreateSubtask(e, task.id)}
            style={{ marginTop: '0.5em', padding: '0.3em', width: '100%' }}
          />
        </div>
      ))}
    </div>
  );
}

export default App;
