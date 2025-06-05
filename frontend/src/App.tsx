import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Books from './Books';
import RegistBook from './RegistBook';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 初期画面（/）でLogin画面にリダイレクト */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<Books />} />
        <Route path="/regist-book" element={<RegistBook />} />
        <Route path="/edit-book/:id" element={<RegistBook />} />
        {/* それ以外のパスも/loginにリダイレクト */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
