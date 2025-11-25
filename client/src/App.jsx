import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

// --- НАЛАШТУВАННЯ ---
const API_BASE = 'http://localhost:5001/api';

// --- ДАНІ ПРО ТЕСТИ ---
const AVAILABLE_TESTS = [
  {
    id: 'compatibility',
    title: 'Тест на сумісність',
    description: 'Оцінка вашої здатності працювати в команді та реагувати на стресові ситуації.',
    questions: [
      { id: 1, text: "Як ви реагуєте на критику з боку командира?", category: "Стресостійкість" },
      { id: 2, text: "Чи комфортно вам працювати у великому колективі?", category: "Комунікабельність" },
      { id: 3, text: "Як швидко ви приймаєте рішення у стресовій ситуації?", category: "Рішучість" },
      { id: 4, text: "Чи готові ви брати на себе відповідальність за помилки інших?", category: "Відповідальність" },
      { id: 5, text: "Як ви оцінюєте свій рівень довіри до побратимів?", category: "Довіра" },
    ]
  },
  {
    id: 'leadership',
    title: 'Оцінка лідерських якостей',
    description: 'Визначення вашого потенціалу як лідера та здатності вести за собою людей. Цей тест допоможе виявити командирські навички.',
    questions: [
      { id: 1, text: "Чи часто ви берете ініціативу у свої руки?", category: "Ініціативність" },
      { id: 2, text: "Чи легко вам переконувати інших у своїй правоті?", category: "Вплив" },
      { id: 3, text: "Чи готові ви приймати непопулярні рішення заради успіху справи?", category: "Рішучість" },
      { id: 4, text: "Як ви ставитеся до делегування повноважень?", category: "Організація" },
      { id: 5, text: "Чи надихають вас складні завдання?", category: "Мотивація" },
    ]
  },
  {
    id: 'combat-resilience',
    title: 'Бойова стійкість',
    description: 'Поглиблений тест для оцінки готовності до виконання завдань в екстремальних умовах.',
    questions: [
      { id: 1, text: "Чи здатні ви зберігати спокій під час раптових гучних звуків або вибухів?", category: "Самоконтроль" },
      { id: 2, text: "Як ви оцінюєте свою здатність концентруватися при сильній фізичній втомі?", category: "Витривалість" },
      { id: 3, text: "Чи легко ви відновлюєте емоційну рівновагу після конфлікту?", category: "Відновлення" },
      { id: 4, text: "Чи можете ви швидко змінити план дій, якщо обставини різко погіршилися?", category: "Адаптивність" },
      { id: 5, text: "Як ви реагуєте на прояви паніки серед оточуючих?", category: "Лідерство" },
      { id: 6, text: "Чи готові ви виконувати накази без обговорення у критичній ситуації?", category: "Дисципліна" },
      { id: 7, text: "Чи здатні ви ефективно діяти в умовах дефіциту сну?", category: "Витривалість" },
      { id: 8, text: "Як ви оцінюєте свою рішучість у ситуації, що загрожує життю?", category: "Сміливість" },
      { id: 9, text: "Чи вдається вам контролювати гнів та агресію?", category: "Самоконтроль" },
      { id: 10, text: "Чи зберігаєте ви ясне мислення при дефіциті часу на прийняття рішення?", category: "Швидкість реакції" }
    ]
  }
];

// --- ГЕНЕРАТОР СТИЛІВ ---
const getStyles = (isDark) => {
  const colors = {
    bg: isDark ? '#121212' : '#f0f2f5',
    cardBg: isDark ? '#1e1e1e' : '#ffffff',
    text: isDark ? '#e0e0e0' : '#333333',
    secondaryText: isDark ? '#aaaaaa' : '#7f8c8d',
    border: isDark ? '#333' : '#ddd',
    inputBg: isDark ? '#2d2d2d' : '#f9f9f9',
    navBg: isDark ? '#1e1e1e' : '#ffffff',
    shadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
    primary: '#3498db', // Синій колір
    danger: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    navShadow: isDark ? '0 2px 10px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.1)'
  };

  return {
    colors, // 👈 ОСЬ ЦЕЙ РЯДОК БУВ ВТРАЧЕНИЙ! ТЕПЕР ВІН ТУТ.
    wrapper: {
      minHeight: '100vh',
      width: '100%',
      backgroundColor: colors.bg,
      color: colors.text,
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      transition: 'background-color 0.3s, color 0.3s'
    },
    container: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      backgroundColor: colors.navBg,
      boxShadow: colors.navShadow,
      borderRadius: '12px',
      marginBottom: '30px',
      transition: 'all 0.3s ease',
      flexWrap: 'wrap'
    },
    navLeft: { display: 'flex', gap: '20px', alignItems: 'center' },
    navRight: { display: 'flex', gap: '15px', alignItems: 'center' },
    logoLink: { fontSize: '20px', fontWeight: 'bold', color: isDark ? '#fff' : '#2c3e50', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' },
    link: { color: colors.text, textDecoration: 'none', fontWeight: '600', fontSize: '16px', transition: 'opacity 0.2s', cursor: 'pointer' },
    adminLink: { color: colors.danger, textDecoration: 'none', fontWeight: '700', fontSize: '16px', border: `1px solid ${colors.danger}`, padding: '5px 10px', borderRadius: '5px' },
    
    card: {
      backgroundColor: colors.cardBg,
      padding: '40px',
      borderRadius: '16px',
      boxShadow: colors.shadow,
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%',
      animation: 'slideUp 0.4s ease-out',
      transition: 'background-color 0.3s'
    },
    adminCard: {
      backgroundColor: colors.cardBg,
      padding: '30px',
      borderRadius: '16px',
      boxShadow: colors.shadow,
      width: '100%',
      animation: 'slideUp 0.4s ease-out',
      transition: 'background-color 0.3s'
    },
    
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { padding: '20px', borderRadius: '12px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    statNumber: { fontSize: '32px', fontWeight: 'bold', margin: '5px 0' },
    statLabel: { fontSize: '14px', opacity: 0.9 },

    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    input: {
      padding: '15px',
      fontSize: '16px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
      backgroundColor: colors.inputBg,
      color: colors.text,
      outline: 'none',
      transition: 'border 0.2s'
    },
    button: {
      padding: '12px 25px',
      fontSize: '16px',
      background: colors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'transform 0.1s, box-shadow 0.2s',
      boxShadow: `0 4px 6px rgba(52, 152, 219, 0.2)`,
      textAlign: 'center',
      textDecoration: 'none',
      display: 'inline-block'
    },
    buttonSecondary: { background: colors.danger, boxShadow: `0 4px 6px rgba(231, 76, 60, 0.2)` },
    
    buttonStart: { 
      background: colors.primary, 
      boxShadow: `0 4px 6px rgba(52, 152, 219, 0.2)`, 
      width: '100%', 
      textAlign: 'center', 
      textDecoration: 'none', 
      display: 'block', 
      padding: '12px 0', 
      fontSize: '16px',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'transform 0.1s, box-shadow 0.2s'
    },
    
    buttonDelete: { background: colors.danger, color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', marginLeft: '10px' },
    buttonPrint: { background: colors.secondaryText, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '15px' },
    buttonTheme: { background: 'transparent', border: `1px solid ${colors.border}`, color: colors.text, padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' },

    title: { textAlign: 'center', color: isDark ? '#fff' : '#2c3e50', marginBottom: '10px', fontSize: '28px' },
    subtitle: { textAlign: 'center', color: colors.secondaryText, marginBottom: '30px', fontSize: '16px' },
    
    questionBlock: { marginBottom: '25px', padding: '20px', border: `1px solid ${colors.border}`, borderRadius: '12px', backgroundColor: isDark ? '#252525' : '#f8f9fa' },
    radioGroup: { display: 'flex', justifyContent: 'space-between', marginTop: '15px', gap: '10px' },
    radioLabel: { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      cursor: 'pointer', 
      padding: '10px', 
      border: `1px solid ${colors.border}`, 
      borderRadius: '8px', 
      flex: 1, 
      transition: 'all 0.2s',
      backgroundColor: colors.cardBg
    },
    radioText: { fontSize: '12px', marginTop: '5px', color: colors.secondaryText, textAlign: 'center' },
    
    resultItem: { padding: '20px', borderLeft: `5px solid ${colors.primary}`, background: isDark ? '#2d2d2d' : '#f8f9fa', borderRadius: '4px', marginBottom: '15px' },
    
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', color: colors.text },
    th: { padding: '15px', textAlign: 'left', borderBottom: `2px solid ${colors.border}`, color: isDark ? '#fff' : '#2c3e50' },
    td: { padding: '15px', borderBottom: `1px solid ${colors.border}`, color: colors.text },

    testGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', marginTop: '20px' },
    
    testCard: { 
      padding: '25px', 
      borderRadius: '12px', 
      border: `1px solid ${colors.border}`, 
      background: colors.cardBg, 
      transition: 'transform 0.2s, box-shadow 0.2s', 
      boxShadow: colors.shadow, 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between', 
      height: '100%',
      gap: '20px'
    },
    testContent: { flex: 1, display: 'flex', flexDirection: 'column' }, 
    testTitle: { fontSize: '20px', fontWeight: 'bold', color: isDark ? '#fff' : '#2c3e50', marginBottom: '10px' },
    testDesc: { color: colors.secondaryText, marginBottom: '20px', lineHeight: '1.5', flex: 1 },
    
    progressBarContainer: { width: '100%', height: '10px', backgroundColor: isDark ? '#333' : '#e0e0e0', borderRadius: '5px', marginBottom: '30px', overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: colors.success, transition: 'width 0.5s ease-in-out' }
  };
};

// --- КОМПОНЕНТИ ---

const Navbar = ({ user, logout, toggleTheme, isDark, styles }) => (
  <nav style={styles.nav} className="nav-container no-print">
    <div className="nav-left" style={styles.navLeft}>
      <Link style={styles.logoLink} to="/">
        🛡️ <span style={{display: 'inline-block'}}>МПС ЗСУ</span>
      </Link>
      <Link style={styles.link} to="/about">Про модуль</Link>
      {user && (
        <>
          <Link style={styles.link} to="/tests">Тестування</Link>
          <Link style={styles.link} to="/results">Результати</Link>
          {user.isAdmin && <Link style={styles.adminLink} to="/admin">Кабінет Командира</Link>}
        </>
      )}
    </div>
    
    <div className="nav-right" style={styles.navRight}>
      <button onClick={toggleTheme} style={styles.buttonTheme} title="Змінити тему">
        {isDark ? '☀️' : '🌙'}
      </button>
      {user ? (
        <>
          <span style={{color: styles.colors.secondaryText}}>Боєць: <strong style={{color: styles.wrapper.color}}>{user.name}</strong></span>
          <button onClick={logout} style={{ ...styles.button, ...styles.buttonSecondary, padding: '8px 20px', fontSize: '14px' }}>Вихід</button>
        </>
      ) : (
        <>
          <Link style={styles.link} to="/login">Вхід</Link>
          <Link style={{...styles.button, textDecoration: 'none', padding: '8px 20px', fontSize: '14px'}} to="/register">Реєстрація</Link>
        </>
      )}
    </div>
  </nav>
);

const AboutPage = ({ styles }) => (
  <div style={styles.card} className="responsive-card">
    <h2 style={styles.title}>Про Програмний Модуль</h2>
    <div style={{lineHeight: '1.6', color: styles.wrapper.color}}>
      <p><strong>Програмний модуль оцінки колективної психологічної сумісності військовослужбовців</strong> розроблений з метою автоматизації процесу психологічного діагностування особового складу.</p>
      <h3 style={{marginTop: '20px', color: styles.colors.primary}}>🎯 Основні функції:</h3>
      <ul style={{marginLeft: '20px', marginBottom: '20px'}}>
        <li>Реєстрація та авторизація військовослужбовців.</li>
        <li>Проходження психологічних тестів у режимі онлайн.</li>
        <li>Автоматичний розрахунок результатів.</li>
        <li>Аналітична панель для командира.</li>
      </ul>
      <h3 style={{marginTop: '20px', color: styles.colors.primary}}>🔬 Методологія:</h3>
      <p>Система використовує адаптовані методики оцінки психологічної стійкості, лідерських якостей та групової сумісності.</p>
      <h3 style={{marginTop: '20px', color: styles.colors.text}}>👨‍💻 Розробник:</h3>
      <p>Курсант Паламарчук Вадим. Курсова робота, 2025 рік.</p>
    </div>
  </div>
);

const AdminDashboard = ({ user, styles }) => {
  const [allResults, setAllResults] = useState([]);
  const [stats, setStats] = useState({ avgScore: 0, totalTests: 0, level: 'Невизначено' });
  const [searchTerm, setSearchTerm] = useState('');
  const [chartData, setChartData] = useState([]);

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({ avgScore: 0, totalTests: 0, level: 'Немає даних' });
      setChartData([]);
      return;
    }
    const totalScoreSum = data.reduce((acc, curr) => acc + curr.totalScore, 0);
    const avg = (totalScoreSum / data.length).toFixed(1);
    let lvl = 'Середній';
    if (avg >= 30) lvl = 'Високий';
    else if (avg <= 15) lvl = 'Низький';

    setStats({ avgScore: avg, totalTests: data.length, level: lvl });

    const chart = data.slice(0, 10).reverse().map(item => ({
      name: item.user?.name?.split(' ')[0] || 'Боєць',
      Бали: item.totalScore,
      Тест: item.testName
    }));
    setChartData(chart);
  };

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`${API_BASE}/tests/all-results`, config);
        setAllResults(res.data);
        calculateStats(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Помилка завантаження даних');
      }
    };
    fetchAllResults();
  }, [user]);

  const filteredResults = allResults.filter(res => 
    res.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Видалити цей результат?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_BASE}/tests/${id}`, config);
        const updatedList = allResults.filter(res => res._id !== id);
        setAllResults(updatedList);
        calculateStats(updatedList);
        toast.success('Видалено');
      } catch (err) {
        console.error(err);
        toast.error('Помилка видалення');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.adminCard} className="print-container responsive-card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '30px'}}>
        <div>
          <h2 style={{...styles.title, textAlign: 'left', marginBottom: '5px'}}>Аналітичний Центр</h2>
          <p style={{...styles.subtitle, textAlign: 'left', marginBottom: '0'}}>Звіт по сумісності особового складу</p>
        </div>
        <button onClick={handlePrint} style={styles.buttonPrint} className="no-print">
          <span style={{fontSize: '18px'}}>🖨️</span> Друк звіту
        </button>
      </div>
      
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, background: styles.colors.primary}}>
          <span style={styles.statNumber}>{stats.totalTests}</span>
          <span style={styles.statLabel}>Тестів</span>
        </div>
        <div style={{...styles.statCard, background: styles.colors.success}}>
          <span style={styles.statNumber}>{stats.avgScore}</span>
          <span style={styles.statLabel}>Сер. бал</span>
        </div>
        <div style={{...styles.statCard, background: stats.level.includes('Високий') ? styles.colors.success : (stats.level.includes('Низький') ? styles.colors.danger : styles.colors.warning)}}>
          <span style={{fontSize: '20px', fontWeight: 'bold', margin: '10px 0'}}>{stats.level}</span>
          <span style={styles.statLabel}>Загальний статус</span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div style={{ height: '300px', marginTop: '20px', marginBottom: '40px' }} className="no-print chart-container">
          <h3 style={{textAlign: 'center', color: styles.colors.text, marginBottom: '20px'}}>Динаміка результатів</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={styles.colors.border} vertical={false} />
              <XAxis dataKey="name" stroke={styles.colors.secondaryText} axisLine={false} tickLine={false} />
              <YAxis stroke={styles.colors.secondaryText} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: styles.colors.cardBg, 
                  color: styles.colors.text,
                  borderRadius: '12px',
                  border: `1px solid ${styles.colors.border}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }} 
                cursor={{fill: 'transparent'}}
              />
              <Legend />
              <Bar dataKey="Бали" fill={styles.colors.primary} radius={[6, 6, 0, 0]} barSize={50} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="no-print" style={{marginBottom: '20px'}}>
        <input type="text" placeholder="🔍 Пошук за прізвищем..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.input} />
      </div>

      <div style={{overflowX: 'auto'}}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{...styles.th, width: '25%'}}>Боєць</th>
              <th style={{...styles.th, width: '30%'}}>Тест</th>
              <th style={{...styles.th, width: '10%'}}>Бали</th>
              <th style={{...styles.th, width: '25%'}}>Висновок</th>
              <th style={{...styles.th, width: '10%'}} className="no-print">Дія</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((res) => (
              <tr 
                key={res._id} 
                style={{...styles.tr, position: 'relative'}} 
              >
                <td style={{...styles.td, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px'}}>
                  <div style={{fontWeight: 'bold', fontSize: '16px'}}>{res.user?.name}</div>
                  <div style={{fontSize: '12px', color: styles.colors.secondaryText}}>{res.user?.email}</div>
                </td>
                <td style={styles.td}>
                  <span style={{display: 'inline-block', background: styles.colors.inputBg, padding: '4px 10px', borderRadius: '6px', fontSize: '13px'}}>
                    {res.testName}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span style={{fontWeight: '800', fontSize: '16px'}}>{res.totalScore}</span>
                    {/* Простий прогрес-бар */}
                    <div style={{flex: 1, height: '6px', background: styles.colors.inputBg, borderRadius: '3px', minWidth: '60px'}}>
                      <div style={{
                        width: `${Math.min(res.totalScore * 2, 100)}%`, // Припускаємо макс ~50
                        height: '100%',
                        background: res.totalScore >= 30 ? styles.colors.success : (res.totalScore <= 15 ? styles.colors.danger : styles.colors.warning),
                        borderRadius: '3px'
                      }}></div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge, 
                    backgroundColor: res.totalScore >= 30 ? `${styles.colors.success}20` : (res.totalScore <= 15 ? `${styles.colors.danger}20` : `${styles.colors.warning}20`),
                    color: res.totalScore >= 30 ? styles.colors.success : (res.totalScore <= 15 ? styles.colors.danger : styles.colors.warning)
                  }}>
                    {res.totalScore >= 30 ? 'Високий' : (res.totalScore <= 15 ? 'Низький' : 'Середній')}
                  </span>
                </td>
                <td style={{...styles.td, borderTopRightRadius: '12px', borderBottomRightRadius: '12px'}} className="no-print">
                  <button onClick={() => handleDelete(res._id)} style={styles.buttonDelete} title="Видалити результат">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TestSelectionPage = ({ styles }) => (
  <div style={{maxWidth: '1000px', margin: '0 auto', width: '100%'}}>
    <h2 style={styles.title}>Доступні Тестування</h2>
    <p style={styles.subtitle}>Оберіть тест для проходження діагностики</p>
    <div style={styles.testGrid}>
      {AVAILABLE_TESTS.map(test => (
        <div key={test.id} style={{...styles.testCard, ':hover': {transform: 'translateY(-5px)'}}}>
          <div style={styles.testContent}>
            <div style={styles.testTitle}>{test.title}</div>
            <div style={styles.testDesc}>{test.description}</div>
            <div style={{display: 'flex', gap: '15px', fontSize: '13px', color: styles.colors.secondaryText, marginBottom: '15px'}}>
              <span>⏱️ {test.time || '5 хв'}</span>
              <span>❓ Питань: {test.questions.length}</span>
            </div>
          </div>
          <Link to={`/test/${test.id}`} style={styles.buttonStart}>
            Розпочати тест
          </Link>
        </div>
      ))}
    </div>
  </div>
);

const TestPage = ({ user, styles }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const currentTest = AVAILABLE_TESTS.find(t => t.id === id) || AVAILABLE_TESTS[0];
  
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / currentTest.questions.length) * 100;

  const handleOptionChange = (qId, value) => setAnswers({ ...answers, [qId]: parseInt(value) });
  
  const submitTest = async (e) => {
    e.preventDefault();
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxPossibleScore = currentTest.questions.length * 5;
    
    let conclusion = "Середній рівень готовності. Рекомендовано додаткове тренування.";
    
    if (totalScore >= maxPossibleScore * 0.8) {
      conclusion = "Високий рівень. Відмінна готовність до виконання завдань.";
    } else if (totalScore <= maxPossibleScore * 0.4) {
      conclusion = "Низький рівень. Потребує підвищеної уваги та роботи з психологом.";
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_BASE}/tests`, { 
        testName: currentTest.title, 
        answers: Object.entries(answers).map(([k, v]) => ({ questionId: k, answer: v })), 
        totalScore, conclusion 
      }, config);
      toast.success(`Тест завершено!`);
      navigate('/results');
    } catch (err) { console.error(err); toast.error('Помилка'); }
  };

  const options = [
    { val: 1, label: "Зовсім ні / Дуже погано" },
    { val: 2, label: "Швидше ні" },
    { val: 3, label: "Важко сказати" },
    { val: 4, label: "Швидше так" },
    { val: 5, label: "Безумовно так / Відмінно" }
  ];

  return (
    <div style={styles.card} className="responsive-card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap'}}>
        <div>
          <h2 style={{...styles.title, marginBottom: 0, textAlign: 'left'}}>{currentTest.title}</h2>
          <p style={{fontSize: '14px', color: styles.colors.secondaryText, margin: '5px 0'}}>{currentTest.description}</p>
        </div>
        <div style={{fontSize: '18px', fontWeight: 'bold', color: styles.colors.primary}}>
          {answeredCount} <span style={{fontSize: '16px', color: styles.colors.secondaryText, fontWeight: '400'}}>/ {currentTest.questions.length}</span>
        </div>
      </div>
      
      <div style={styles.progressBarContainer}>
        <div style={{...styles.progressBar, width: `${progress}%`}}></div>
      </div>

      <form onSubmit={submitTest} style={{marginTop: '30px'}}>
        {currentTest.questions.map((q) => (
          <div key={q.id} style={styles.questionBlock}>
            <div style={{marginBottom: '20px'}}>
              <span style={{fontSize: '12px', color: styles.colors.primary, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1.5px'}}>{q.category}</span>
              <p style={{fontSize: '18px', marginTop: '8px', marginBottom: '0', fontWeight: '600', color: styles.colors.text}}>{q.text}</p>
            </div>
            <div style={styles.radioGroup} className="radio-group-responsive">
              {options.map((opt) => (
                <label key={opt.val} style={{
                  ...styles.radioLabel,
                  backgroundColor: answers[q.id] === opt.val ? (styles.colors.primary + '15') : styles.colors.inputBg,
                  borderColor: answers[q.id] === opt.val ? styles.colors.primary : styles.colors.border,
                  transform: answers[q.id] === opt.val ? 'scale(1.02)' : 'scale(1)'
                }}>
                  <span style={{marginBottom: '5px', fontWeight: 'bold', fontSize: '18px', color: answers[q.id] === opt.val ? styles.colors.primary : styles.colors.text}}>{opt.val}</span>
                  <span style={styles.radioText} className="radio-text">{opt.label}</span>
                  <input 
                    type="radio" 
                    name={`q-${q.id}`} 
                    value={opt.val} 
                    required 
                    onChange={(e) => handleOptionChange(q.id, e.target.value)}
                    style={{display: 'none'}}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" style={{...styles.button, width: '100%', marginTop: '20px', fontSize: '18px', padding: '16px'}}>Завершити тест та отримати результат</button>
      </form>
    </div>
  );
};

const ResultsPage = ({ user, styles }) => {
  const [results, setResults] = useState([]);
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`${API_BASE}/tests/myresults`, config);
        setResults(res.data);
      } catch (err) { console.error(err); }
    };
    fetchResults();
  }, [user]);

  const chartData = results.slice(0, 5).reverse().map(res => ({
    subject: res.testName.split(' ')[0],
    A: res.totalScore,
    fullMark: 50
  }));

  return (
    <div style={styles.card} className="responsive-card">
      <h2 style={styles.title}>Ваші Результати</h2>
      
      {results.length > 0 && (
        <div style={{height: '300px', marginBottom: '40px'}} className="chart-container">
           <h4 style={{textAlign: 'center', color: styles.colors.secondaryText, marginBottom: '20px'}}>Діаграма останніх успіхів</h4>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" stroke={styles.colors.border} vertical={false} />
               <XAxis dataKey="subject" stroke={styles.colors.secondaryText} axisLine={false} tickLine={false} />
               <YAxis stroke={styles.colors.secondaryText} axisLine={false} tickLine={false} />
               <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: styles.colors.cardBg, color: styles.colors.text, borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
               <Bar dataKey="A" name="Бали" fill={styles.colors.success} barSize={40} radius={[6, 6, 0, 0]} animationDuration={1500} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      )}

      <div style={{marginTop: '20px'}}>
        {results.length === 0 ? <p style={{textAlign: 'center', color: styles.colors.secondaryText}}>Історія порожня.</p> : results.map((res) => (
          <div key={res._id} style={styles.resultItem}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px'}}>
              <div>
                <h3 style={{margin: '0 0 5px 0', color: styles.colors.text}}>{res.testName}</h3>
                <span style={{fontSize: '13px', color: styles.colors.secondaryText}}>📅 {new Date(res.createdAt).toLocaleString()}</span>
              </div>
              <div style={{textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px'}}>
                <span style={{
                  ...styles.badge, 
                  backgroundColor: res.totalScore >= 30 ? `${styles.colors.success}20` : `${styles.colors.danger}20`,
                  color: res.totalScore >= 30 ? styles.colors.success : styles.colors.danger,
                  fontSize: '14px'
                }}>
                  {res.totalScore} балів
                </span>
              </div>
            </div>
            <div style={{marginTop: '15px', padding: '15px', backgroundColor: styles.colors.inputBg, borderRadius: '8px', fontSize: '14px', color: styles.colors.text, lineHeight: '1.5'}}>
              <strong>Висновок:</strong> {res.conclusion}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = ({ user, styles }) => (
  <div style={{textAlign: 'center', width: '100%'}}>
    <div style={{...styles.card, maxWidth: '800px', padding: '60px 40px'}} className="responsive-card">
      <h1 style={{...styles.title, fontSize: '42px', marginBottom: '20px'}}>🛡️ Модуль Психологічної Сумісності</h1>
      <p style={{...styles.subtitle, fontSize: '20px', maxWidth: '600px', margin: '0 auto 40px auto'}}>Автоматизована система оцінки та аналізу психологічного стану військовослужбовців.</p>
      {user ? (
        <div style={{background: styles.colors.inputBg, padding: '30px', borderRadius: '20px', border: `1px solid ${styles.colors.border}`}}>
          <h3 style={{margin: '0 0 15px 0', color: styles.colors.text, fontSize: '24px'}}>Привіт, {user.name}!</h3>
          <p style={{color: styles.colors.secondaryText, marginBottom: '30px'}}>Система готова до роботи. Оберіть дію:</p>
          <div style={{display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap'}}>
            <Link to="/tests" style={{...styles.button, ...styles.buttonStart, width: 'auto', padding: '15px 30px', fontSize: '18px'}}>Розпочати тестування</Link>
            {user.isAdmin && <Link to="/admin" style={{...styles.button, background: '#ef4444', width: 'auto', padding: '15px 30px', fontSize: '18px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'}}>Кабінет Командира</Link>}
          </div>
        </div>
      ) : (
        <div style={{padding: '20px'}}>
          <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
             <Link to="/login" style={{...styles.button, width: '160px'}}>Увійти</Link>
             <Link to="/register" style={{...styles.button, background: styles.colors.inputBg, color: styles.colors.text, border: `1px solid ${styles.colors.border}`, width: '160px', boxShadow: 'none'}}>Реєстрація</Link>
          </div>
        </div>
      )}
    </div>
  </div>
);

const Login = ({ setUser, styles }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/users/login`, { email, password });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Вхід успішний!');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.msg || 'Помилка входу'); }
  };
  return (
    <div style={styles.card} className="responsive-card">
      <h2 style={styles.title}>Вхід</h2>
      <p style={{textAlign: 'center', color: styles.colors.secondaryText, marginBottom: '30px'}}>Введіть ваші облікові дані</p>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input type="email" placeholder="Email адреса" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
        <button type="submit" style={styles.button}>Увійти</button>
      </form>
    </div>
  );
};

const Register = ({ setUser, styles }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/users`, { name, email, password });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Реєстрація успішна!');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.msg || 'Помилка'); }
  };
  return (
    <div style={styles.card} className="responsive-card">
      <h2 style={styles.title}>Реєстрація</h2>
      <p style={{textAlign: 'center', color: styles.colors.secondaryText, marginBottom: '30px'}}>Створіть новий акаунт</p>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input type="text" placeholder="ПІБ (Повне ім'я)" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
        <input type="password" placeholder="Пароль (мінімум 6 символів)" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
        <button type="submit" style={styles.button}>Зареєструватися</button>
      </form>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const styles = getStyles(isDark);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Ви вийшли');
  };

  return (
    <>
      <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          body { margin: 0; padding: 0; width: 100%; height: 100%; display: block !important; background-color: ${styles.wrapper.backgroundColor}; }
          #root { width: 100%; height: 100%; }
          /* Скролбар для темної теми */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: ${isDark ? '#1e1e1e' : '#f1f1f1'}; }
          ::-webkit-scrollbar-thumb { background: ${isDark ? '#555' : '#ccc'}; borderRadius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: ${isDark ? '#777' : '#aaa'}; }
          @media print { .no-print { display: none !important; } body { background-color: white !important; } * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
          
          /* Мобільні стилі (ВИПРАВЛЕНО) */
          @media (max-width: 768px) {
            .nav-container { flex-direction: column; gap: 15px; padding: 15px !important; }
            .nav-left, .nav-right { width: 100%; justify-content: center; flex-wrap: wrap; }
            .responsive-card { padding: 20px !important; width: 95% !important; margin: 0 auto !important; }
            .container { padding: 10px 5px !important; }
            .radio-group-responsive { flex-direction: column; }
            .radio-text { font-size: 14px !important; }
            h1 { font-size: 24px !important; }
            h2 { font-size: 20px !important; }
            .chart-container { height: 200px !important; }
            table { font-size: 12px; display: block; overflow-x: auto; white-space: nowrap; } /* Горизонтальний скрол таблиці */
            th, td { padding: 10px !important; }
            .statNumber { font-size: 28px !important; }
            .statLabel { font-size: 12px !important; }
          }
      `}</style>
      <div style={styles.wrapper}>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { background: styles.card.backgroundColor, color: styles.wrapper.color, border: `1px solid ${styles.colors.border}` } }} />
        <Router>
          <div style={styles.container} className="container">
            <Navbar user={user} logout={logout} toggleTheme={toggleTheme} isDark={isDark} styles={styles} />
            <Routes>
              <Route path="/" element={<Home user={user} styles={styles} />} />
              <Route path="/about" element={<AboutPage styles={styles} />} />
              <Route path="/login" element={<Login setUser={setUser} styles={styles} />} />
              <Route path="/register" element={<Register setUser={setUser} styles={styles} />} />
              {user && (
                <>
                  <Route path="/tests" element={<TestSelectionPage styles={styles} />} />
                  <Route path="/test/:id" element={<TestPage user={user} styles={styles} />} />
                  <Route path="/results" element={<ResultsPage user={user} styles={styles} />} />
                  {user.isAdmin && <Route path="/admin" element={<AdminDashboard user={user} styles={styles} />} />}
                </>
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </div>
    </>
  );
}

export default App;