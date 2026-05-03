
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import { AppTab, AnalysisResult, QuizQuestion } from './types';
import { analyzeVerse, generateQuiz, generateVerseOnMeter, findRhymes } from './services/geminiService';
import ScansionChart from './components/ScansionChart';
import { 
  Send, 
  RefreshCw, 
  Award, 
  BrainCircuit, 
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PenTool,
  Sparkles,
  Search,
  Share2,
  Trash2,
  ChevronLeft,
  User,
  RotateCcw,
  Lightbulb,
  PartyPopper,
  Library,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Quote,
  Music,
  Hash,
  Star,
  Zap,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ANALYZER);
  
  // Analyzer States
  const [verseInput, setVerseInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>(() => {
    const saved = localStorage.getItem('arudi_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  // Sync history to localStorage
  React.useEffect(() => {
    localStorage.setItem('arudi_history', JSON.stringify(history));
  }, [history]);

  // Learning States
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [quizTips, setQuizTips] = useState('');
  const [quizLevel, setQuizLevel] = useState('مبتدئ');

  // Meters State
  const [expandedMeterIdx, setExpandedMeterIdx] = useState<number | null>(null);
  const [meterSearch, setMeterSearch] = useState('');

  // Tools States
  const [toolPrompt, setToolPrompt] = useState('');
  const [selectedMeter, setSelectedMeter] = useState('الطويل');
  const [generatedVerse, setGeneratedVerse] = useState('');
  const [rhymeInput, setRhymeInput] = useState('');
  const [rhymes, setRhymes] = useState<string[]>([]);
  const [toolTab, setToolTab] = useState<'writer' | 'rhymes'>('writer');

  const arabicMeters = useMemo(() => [
    { 
      name: 'الطويل', 
      key: 'طويلٌ لهُ دُونَ البُحورِ فضائلُ', 
      circle: 'دائرة المختلفة', 
      tafila: 'فعولن مفاعيلن فعولن مفاعلن',
      description: 'بحر جليل فخم ورصين، يتميز بطول نَفَسِه واتساع مفرداته. إيقاعه متموج يتناوب فيه الطول والقصر، مما يجعله الأنسب للحكم والملاحم الشعرية العميقة.',
      examples: [
        "قِفَا نَبْكِ مِنْ ذِكْرَى حَبِيبٍ ومَنْزِلِ ** بِسِقْطِ اللِّوَى بَيْنَ الدَّخُولِ فَحَوْمَلِ",
        "أبا هندٍ فلا تَعجَلْ علينا ** وأَنظِرنا نُخبِّركَ اليقينا",
        "لعمرك ما ضاقت بلادٌ بأهلها ** ولكنّ أخلاق الرّجال تضيقُ"
      ]
    },
    { 
      name: 'المديد', 
      key: 'لِمديدِ الشِّعرِ عِندِي صِفاتُ', 
      circle: 'دائرة المختلفة', 
      tafila: 'فاعلاتن فاعلن فاعلاتن',
      description: 'بحر خفيف وهادئ، يميل إيقاعه للرقة والسلاسة مع تكرار نغمات مديدة متزنة. يبعث شعوراً باللطافة والوجد، ويكثر في الوصف الوجداني الهادئ.',
      examples: [
        "يا لَبَكرٍ أَنشِروا لي كُلَيْباً ** يا لَبَكرٍ أينَ أينَ الفِرارُ",
        "إنّما الدّنيا خيالٌ باهتٌ ** مثلما تَمضي بنا الأقدارُ"
      ]
    },
    { 
      name: 'البسيط', 
      key: 'إنَّ البسيطَ لديهِ يُبسطُ الأملُ', 
      circle: 'دائرة المختلفة', 
      tafila: 'مستفعلن فاعلن مستفعلن فاعلن',
      description: 'بحر منساب وجزل، يتميز بإيقاع مرن يجمع بين القوة والسهولة (التبسيط). يمنح شعراً مريحاً للنفس، ويصلح للحكمة والمدح والوصف الشامل.',
      examples: [
        "الخَيْلُ وَاللّيْلُ وَالبَيْداءُ تَعْرِفُني ** وَالسّيْفُ وَالرّمحُ وَالقِرْطاسُ وَالقَلَمُ",
        "يا نائحَ الطَّلْحِ أَشباهٌ عَوادينا ** نَأْسى لِواديكمُ أَم نَأْسى لِوادينا"
      ]
    },
    { 
      name: 'الوافر', 
      key: 'بُحورُ الشِّعرِ وافِرُها جَميلُ', 
      circle: 'دائرة المؤتلفة', 
      tafila: 'مفاعلتن مفاعلتن فعولن',
      description: 'بحر عذب وجرس موسيقي قوي، يتميز بنبرة واضحة ومبهجة نتيجة تكرار التفعيلة السباعية. يبعث روح الحيوية والجمال والوضوح في المشاعر.',
      examples: [
        "سكتُّ فغرَّ أعدائي السُّكوتُ ** وظنُّوني لأهلي قد نسيتُ",
        "إذا فنيَتْ ذنوبُكَ فاستعدَّا ** لِتُجزى بالذي قدَّمتَ نَقدا"
      ]
    },
    { 
      name: 'الكامل', 
      key: 'كَمَلَ الجمالُ مِنَ البُحورِ الكاملُ', 
      circle: 'دائرة المؤتلفة', 
      tafila: 'متفاعلن متفاعلن متفاعلن',
      description: 'بحر فخم وقوي الإيقاع، يتميز بنبضات منتظمة وجزلة توحي بالاكتمال. يوفر مرونة كبيرة في التعبير، ويميل للرصانة والفخر والجزالة اللغوية.',
      examples: [
        "وإذا صحوتُ فما أقصرُ عن ندىً ** وكما علمتِ شمائلي وتكرُّمي",
        "يا دارَ مَيَّةَ بالعلياءِ فالسَّنَدِ ** أقْوَتْ وطالَ عليها سالفُ الأَبَدِ"
      ]
    },
    { 
      name: 'الهزج', 
      key: 'على الأهزاجِ تسهيلُ', 
      circle: 'دائرة المجتلبة', 
      tafila: 'مفاعيلن مفاعيلن',
      description: 'بحر خفيف وسريع النغم، يتميز بإيقاع راقص وخفيف يوحي بالبهجة والسرور. يكثر استخدامه في المقطوعات القصيرة والغزل والتهاني.',
      examples: [
        "صفحنا عن بني ذهلٍ ** وقلنا القوم إخوانُ",
        "غزالٌ في الهوى قلبي ** بنارِ الوجدِ حيرانُ"
      ]
    },
    { 
      name: 'الرجز', 
      key: 'في أبحرِ الأرجازِ بحرٌ يسهلُ', 
      circle: 'دائرة المجتلبة', 
      tafila: 'مستفعلن مستفعلن مستفعلن',
      description: 'يُعرف بـ "حمار الشعراء" لسهولته وكثرة تنوعه. إيقاعه مدرسي ومنتظم جداً، مما يجعله الأفضل للمنظومات التعليمية والقصائد السريعة.',
      examples: [
        "ما أطيبَ العيشَ لولا أنَّهُ ** ممرٌّ كأحلامِ الكرى والظِّلِّ",
        "إنّي امرؤٌ لم تُعيني المذاهبُ ** والعيشُ لا يذهبُ إلاّ الملاعبُ"
      ]
    },
    { 
      name: 'الرمل', 
      key: 'رملُ الأبحرِ ترويهِ الثقاتُ', 
      circle: 'دائرة المجتلبة', 
      tafila: 'فاعلاتن فاعلاتن فاعلاتن',
      description: 'بحر رقيق وحزين الإيقاع، يشبه في تلاحق نغماته حركة الرمال الهادئة. يوحي بالوجد والشوق والشجن الشفيف، ويناسب المناجاة الصوفية.',
      examples: [
        "لا تَلُومي في الهوى قلبي فقد ** سُقِيَ الحُبَّ بكأساتِ الودادِ",
        "منْ يهنْ يسهلِ الهوانُ عليهِ ** ما لجرحٍ بميتٍ إيلامُ"
      ]
    },
    { 
      name: 'السريع', 
      key: 'بحرٌ سريعٌ مالهُ ساحلُ', 
      circle: 'دائرة المشتبهة', 
      tafila: 'مستفعلن مستفعلن مفعولات',
      description: 'بحر قوي ونشط، يتميز بإيقاع متلاحق يبعث على الحماس والسرعة في طرح المعاني. يشبه دقات القلب المتسارعة، ويناسب المواقف الانفعالية.',
      examples: [
        "النشرُ مسكٌ والوجوهُ دجىً ** والشعرُ ليلٌ والجبينُ ضحى",
        "يا ليتني كنتُ فيكمْ صبياً ** أعدو بليلٍ خلفَ الأماني"
      ]
    },
    { 
      name: 'المنسرح', 
      key: 'منسرحٌ فيهِ يُضربُ المثلُ', 
      circle: 'دائرة المشتبهة', 
      tafila: 'مستفعلن مفعولات مستفعلن',
      description: 'بحر منساب ورشيق، يتميز بليونة في الانتقال بين نغماته مما يوحي بالسهولة والاطمئنان. يجمع بين الانسياب والجزالة في بناء الجملة.',
      examples: [
        "يا من غدا في صبابةٍ وَلَهاً ** ما أنتَ إلاّ في لوعةٍ أبدا",
        "صبرتُ حتّى مَلّ الصبرُ صبري ** وقُلتُ يا دهرُ هلْ لكَ مِن غدرِ"
      ]
    },
    { 
      name: 'الخفيف', 
      key: 'يا خفيفاً خفّتْ بهِ الحركاتُ', 
      circle: 'دائرة المشتبهة', 
      tafila: 'فاعلاتن مستفعلن فاعلاتن',
      description: 'بحر لطيف ومتزن بشكل مذهل، يميل للرقة والاعتدال الموسيقي. يجمع بين هيبة الطويل وسرعة الرجز، وهو المفضل لكثير من الشعراء المعاصرين.',
      examples: [
        "إنّ حظّي كدقيقٍ فوقَ شوكٍ نثروه ** ثمّ قالوا لِحُفاةٍ في يوم ريحٍ اجمعوه",
        "كمْ ملوكٍ قد مَلَكوا ثمّ بـادوا ** كأنّ الذي مَضى لمْ يَكُنْ"
      ]
    },
    { 
      name: 'المضارع', 
      key: 'تُعدُّ المُضارعاتُ', 
      circle: 'دائرة المشتبهة', 
      tafila: 'مفاعيلن فاعلاتن',
      description: 'بحر قصير وفريد، يتميز بوقفات رقيقة وإيقاع يميل للانقطاع الذكي. يبعث شعوراً بالتركيز والخصوصية، وهو من البحور النادرة والجميلة.',
      examples: [
        "دعاني إلى التّصابي ** خيالٌ زارَ من حبيبِ",
        "سقتني عيونُ شوقٍ ** رحيقاً من المشيبِ"
      ]
    },
    { 
      name: 'المقتضب', 
      key: 'اقتضبْ كما سألوا', 
      circle: 'دائرة المشتبهة', 
      tafila: 'مفعولات مستفعلن',
      description: 'بحر سريع جداً ومقتضب في نبرته، يوحي بالإيجاز والسرعة والحسم. إيقاعه قافز ومباشر، وقليل الاستخدام لبساطة نظمه.',
      examples: [
        "يا غزالاً سَبى نَهى ** وجلا في الهوى سَنا",
        "رأينا في الخيالِ طيفاً ** مَرّ سريعاً فما وَنى"
      ]
    },
    { 
      name: 'المجتث', 
      key: 'إنْ جُثَّتِ الحركاتُ', 
      circle: 'دائرة المشتبهة', 
      tafila: 'مستفعلن فاعلاتن',
      description: 'بحر رشيق وغنائي بامتياز، يتميز برقته وسهولة تحويله لموسيقى مغناة. يبعث شعوراً بالرقة والانسجام، وكثيراً ما استعمل في الأندلس.',
      examples: [
        "القلبُ في غَمَراتِ ** والحبُّ في عَبَراتِ",
        "البدرُ في سماواتِ ** والزّهرُ في رَوْضاتِ"
      ]
    },
    { 
      name: 'التقارب', 
      key: 'عنِ المتقاربِ قالَ الخليلُ', 
      circle: 'دائرة المتفقة', 
      tafila: 'فعولن فعولن فعولن فعولن',
      description: 'بحر حماسي قوي، يشبه إيقاعه المتلاحق وقع سنابك الخيل أو المسير العسكري. يبعث روح العزم والإقدام، وهو المفضل لقصائد الفخر والمعارك.',
      examples: [
        "أتتني على قدرٍ طيةٌ ** تهادى بها النّفسُ في ريبةِ",
        "لأمرٍ ما يسودُ من يسودُ ** ويُدركُ نَيلَ مَطلبهِ العبيدُ"
      ]
    },
    { 
      name: 'المتدارك', 
      key: 'حركاتُ المُحدثِ تنتقلُ', 
      circle: 'دائرة المتفقة', 
      tafila: 'فاعلن فاعلن فاعلن فاعلن',
      description: 'بحر سريع وواثب، يميل للحركة والنشاط المتلاحق ("الخبب"). إيقاعه متدارك يملأ الفراغات الموسيقية، مما يجعله حيوياً وحداثياً.',
      examples: [
        "جاءنا القومُ بالخبرِ ** فجزاهمُ اللهُ بالظفرِ",
        "يا ليلُ الصبُّ متى غدُه ** أقيامُ الساعةِ موعدُه"
      ]
    },
  ], []);

  const filteredMeters = useMemo(() => {
    return arabicMeters.filter(m => m.name.includes(meterSearch) || m.key.includes(meterSearch));
  }, [meterSearch, arabicMeters]);

  const analysisMeterInfo = useMemo(() => {
    if (!analysis) return null;
    return arabicMeters.find(m => 
      analysis.meterName.includes(m.name) || 
      (m.name !== 'عام' && m.name !== 'نثر' && analysis.meterName.includes(m.name))
    ) || arabicMeters.find(m => analysis.meterName.toLowerCase().includes(m.name.toLowerCase()));
  }, [analysis, arabicMeters]);

  const handleAnalyze = async (input?: string) => {
    const textToAnalyze = input || verseInput;
    if (!textToAnalyze.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await analyzeVerse(textToAnalyze);
      setAnalysis(result);
      setHistory(prev => [result, ...prev.filter(h => h.verse !== result.verse)].slice(0, 10));
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء تحليل البيت. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const insertRandomExample = () => {
    const allExamples = arabicMeters.flatMap(m => m.examples);
    const random = allExamples[Math.floor(Math.random() * allExamples.length)];
    setVerseInput(random);
  };

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const startQuizFlow = async (level: string) => {
    setQuizLevel(level);
    setIsLoading(true);
    setSelectedAnswer(null);
    try {
      const { questions, tips } = await generateQuiz(level);
      setQuiz(questions);
      setQuizTips(tips);
      setQuizStarted(true);
      setIsQuizFinished(false);
      setCurrentQuestion(0);
      setScore(0);
    } catch (error) {
      console.error(error);
      alert("فشل توليد التحدي. جرب لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === quiz[currentQuestion].correctIndex) {
      setScore(s => s + 10);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestion + 1 < quiz.length) {
      setCurrentQuestion(q => q + 1);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleToolAction = async () => {
    if (!toolPrompt.trim()) return;
    setGeneratedVerse('');
    setIsLoading(true);
    try {
      const res = await generateVerseOnMeter(toolPrompt, selectedMeter);
      setGeneratedVerse(res);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "فشل توليد البيت الشعري.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRhymeSearch = async () => {
    if (!rhymeInput.trim()) return;
    setRhymes([]);
    setIsLoading(true);
    try {
      const result = await findRhymes(rhymeInput);
      setRhymes(result);
    } catch (error: any) {
      console.error(error);
      alert("فشل البحث عن القوافي.");
    } finally {
      setIsLoading(false);
    }
  };

  const shareAnalysis = () => {
    if (!analysis) return;
    const text = `تحليل عروضي لبيت: ${analysis.verse}\nالبحر: ${analysis.meterName}\nتم التحليل بواسطة تطبيق عروضي AI`;
    if (navigator.share) {
      navigator.share({ title: 'عروضي AI', text });
    } else {
      navigator.clipboard.writeText(text);
      alert("تم نسخ التحليل للحافظة!");
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setVerseInput('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("تم النسخ!");
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === AppTab.ANALYZER && (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6 relative">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-xl">
                  <BrainCircuit className="text-emerald-600 w-6 h-6" />
                </div>
                محلل العروض الذكي
              </h2>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-slate-400 hover:text-emerald-600 flex items-center gap-1.5 text-sm font-bold transition-all p-2 hover:bg-emerald-50 rounded-lg"
              >
                <History size={18} />
                {showHistory ? 'رجوع للتحليل' : 'السجل'}
              </button>
            </div>

            {showHistory ? (
              <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-top-4 duration-300">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 italic">لا يوجد سجل تحليل حالياً</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer group transition-all"
                      onClick={() => {
                        setAnalysis(item);
                        setVerseInput(item.verse);
                        setShowHistory(false);
                      }}
                    >
                      <div className="truncate flex-1 text-right">
                        <p className="poetry-font text-xl truncate text-slate-700">{item.verse}</p>
                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest bg-white px-2 py-0.5 rounded-full border border-emerald-100">{item.meterName}</span>
                      </div>
                      <ChevronLeft size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors mr-2" />
                    </div>
                  ))
                )}
                {history.length > 0 && (
                  <button 
                    onClick={() => setHistory([])}
                    className="w-full py-3 text-xs text-red-400 hover:text-red-600 font-bold flex items-center justify-center gap-1.5 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={14} /> مسح السجل بالكامل
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="relative group">
                  <textarea
                    className="w-full p-6 poetry-font text-2xl md:text-3xl border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none min-h-[160px] transition-all bg-slate-50 focus:bg-white text-right placeholder:text-slate-300 leading-relaxed shadow-inner"
                    placeholder="ضع بيت الشعر هنا لوزنه..."
                    value={verseInput}
                    onChange={(e) => setVerseInput(e.target.value)}
                  />
                  <div className="absolute left-4 bottom-4 flex gap-2">
                     <button 
                        onClick={insertRandomExample}
                        title="مثال عشوائي"
                        className="p-3 bg-white text-slate-400 hover:text-amber-600 hover:shadow-md rounded-full transition-all shadow-sm"
                     >
                      <Zap size={24} />
                     </button>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAnalyze()}
                    disabled={isLoading || !verseInput.trim()}
                    className="flex-[3] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:shadow-none"
                  >
                    {isLoading ? <RefreshCw className="animate-spin" /> : <Send size={22} />}
                    {isLoading ? 'جاري التحليل...' : 'تحليل ميزان البيت'}
                  </button>
                  
                  {analysis && (
                    <button
                      onClick={clearAnalysis}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center transition-all p-4"
                      title="مسح"
                    >
                      <RotateCcw size={22} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {analysis && !isLoading && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 fill-mode-both">
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                <div className="flex flex-col items-center text-center mb-10">
                   <div className={`mb-4 px-6 py-2 rounded-full flex items-center gap-2 text-sm font-black tracking-wide ${
                    analysis.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  } animate-in zoom-in duration-500 delay-200`}>
                    {analysis.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    {analysis.isCorrect ? 'البيت موزون وصحيح' : 'يوجد كسر في الوزن'}
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">بحر القصيدة</span>
                    <div className="flex items-center justify-center gap-3 group relative">
                      <h3 className="text-5xl font-black text-slate-900 poetry-font animate-in slide-in-from-bottom-2 duration-500 delay-300">
                        بحر {analysis.meterName}
                      </h3>
                      {analysisMeterInfo && (
                        <div className="relative">
                          <div className="bg-slate-100 p-1.5 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 cursor-help transition-all shadow-sm">
                            <Info size={16} />
                          </div>
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 p-5 bg-slate-900/95 backdrop-blur-sm text-white text-xs rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-right border border-white/10">
                            <div className="flex items-center justify-end gap-2 mb-2 text-emerald-400 font-black uppercase tracking-widest border-b border-white/10 pb-2">
                              <span>عن بحر {analysisMeterInfo.name}</span>
                              <Sparkles size={12} />
                            </div>
                            <p className="leading-relaxed font-medium text-[11px]">
                              {analysisMeterInfo.description}
                            </p>
                            <div className="mt-3 pt-2 border-t border-white/10 text-emerald-300 italic font-bold">
                              مفتاح البحر: {analysisMeterInfo.key}
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-10 animate-in fade-in duration-700 delay-400">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                    <span className="text-sm font-bold text-slate-500">التقطيع والنبض العروضي</span>
                  </div>
                  <ScansionChart scansion={analysis.scansion} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50 transition-all">
                    <span className="text-xs font-black text-emerald-600/60 block mb-3 uppercase tracking-tighter text-right">الكتابة العروضية</span>
                    <p className="poetry-font text-2xl text-emerald-900 text-right">{analysis.arudiWriting}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50 transition-all">
                    <span className="text-xs font-black text-slate-400 block mb-3 uppercase tracking-tighter text-right">تفعيلات البيت</span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {analysis.tafilat.map((tafila, i) => (
                        <span key={i} className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-lg">
                          {tafila}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {analysis.errors.length > 0 && (
                  <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl text-right animate-in slide-in-from-left-4 duration-500">
                    <h4 className="flex items-center justify-end gap-2 text-rose-800 font-black mb-3">
                      ملاحظات حول الكسر العروضي
                      <AlertCircle size={20} />
                    </h4>
                    <ul className="space-y-2">
                      {analysis.errors.map((err, i) => (
                        <li key={i} className="text-rose-700 text-sm font-medium flex items-center justify-end gap-2">
                          {err}
                          <div className="w-1 h-1 bg-rose-400 rounded-full" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-10 flex gap-3 animate-in fade-in duration-500 delay-700">
                  <button 
                    onClick={shareAnalysis}
                    className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg"
                  >
                    <Share2 size={20} />
                    نشر النتيجة
                  </button>
                  <button 
                    onClick={() => copyToClipboard(analysis.verse)}
                    className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                    title="نسخ البيت"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === AppTab.LEARN && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {!quizStarted ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm text-center border border-slate-100">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-amber-600 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">أكاديمية عروضي</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                تعلم أسرار الشعر العربي من خلال تمارين تفاعلية صممها الذكاء الاصطناعي خصيصاً لمستواك.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-right">
                <button onClick={() => startQuizFlow('مبتدئ')} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                  <div className="text-emerald-700 font-bold mb-1">المبتدئ</div>
                  <div className="text-xs text-emerald-600">أساسيات البحور والتقطيع</div>
                </button>
                <button onClick={() => startQuizFlow('متوسط')} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors">
                  <div className="text-slate-700 font-bold mb-1">المتوسط</div>
                  <div className="text-xs text-slate-600">الزحافات والعلل</div>
                </button>
                <button onClick={() => startQuizFlow('متقدم')} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors">
                  <div className="text-slate-700 font-bold mb-1">المتقدم</div>
                  <div className="text-xs text-slate-600">نقد النصوص والتحليل</div>
                </button>
              </div>
              <button
                onClick={() => startQuizFlow('عشوائي')}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="animate-spin" /> : <Zap size={18} />}
                {isLoading ? 'جاري التوليد...' : 'ابدأ التحدي السريع'}
              </button>
            </div>
          ) : isQuizFinished ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center border border-slate-100">
                <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                  <PartyPopper size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">أحسنت صنعاً!</h2>
                <div className="bg-slate-50 p-6 rounded-3xl inline-block min-w-[200px] mb-8">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">مجموع النقاط</div>
                  <div className="text-5xl font-black text-emerald-600">{score}</div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setQuizStarted(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">العودة للقائمة</button>
                  <button onClick={() => startQuizFlow(quizLevel)} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all">تحدي جديد</button>
                </div>
              </div>
              <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 text-right animate-in fade-in duration-700 delay-300">
                 <div className="flex items-center justify-between mb-4 text-amber-700">
                    <button 
                       onClick={() => copyToClipboard(quizTips)}
                       className="p-2.5 bg-amber-100/50 hover:bg-amber-200/50 text-amber-600 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-sm active:scale-95"
                       title="نسخ النصيحة"
                    >
                       <Copy size={16} />
                       <span>نسخ النصيحة</span>
                    </button>
                    <div className="flex items-center gap-3">
                       <h4 className="font-black text-lg">نصيحة "عروضي" الذهبية</h4>
                       <div className="bg-amber-200 p-2 rounded-xl"><Lightbulb size={24} /></div>
                    </div>
                 </div>
                 <p className="text-amber-900 leading-relaxed text-lg poetry-font pr-2">{quizTips}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-right animate-in slide-in-from-bottom-4">
              <div className="flex flex-row-reverse justify-between items-center mb-8 border-b border-slate-50 pb-4">
                <span className="bg-slate-100 px-4 py-1 rounded-full text-xs font-black text-slate-400">سؤال {currentQuestion + 1} من {quiz.length}</span>
                <div className="flex items-center gap-2">
                   <Star className="text-amber-400" size={18} fill="currentColor" />
                   <span className="text-emerald-600 font-black text-xl">{score}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">{quiz[currentQuestion].question}</h3>
              <div className="space-y-4">
                {quiz[currentQuestion].options.map((opt, i) => {
                  const isCorrect = i === quiz[currentQuestion].correctIndex;
                  const isSelected = i === selectedAnswer;
                  
                  let buttonClass = "border-slate-50 hover:border-emerald-500 hover:bg-emerald-50";
                  if (selectedAnswer !== null) {
                    if (isCorrect) buttonClass = "border-emerald-500 bg-emerald-50 text-emerald-700";
                    else if (isSelected) buttonClass = "border-rose-500 bg-rose-50 text-rose-700";
                    else buttonClass = "opacity-50 grayscale border-slate-50";
                  }

                  return (
                    <button 
                      key={i} 
                      onClick={() => handleAnswerSelect(i)} 
                      disabled={selectedAnswer !== null}
                      className={`w-full p-5 text-right border-2 rounded-2xl transition-all font-bold flex flex-row-reverse justify-between items-center group shadow-sm ${buttonClass}`}
                    >
                      <span className="text-lg">{opt}</span>
                      <div className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedAnswer !== null && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 
                        selectedAnswer !== null && isSelected && !isCorrect ? 'bg-rose-500 border-rose-500 text-white' : 
                        'border-slate-200 group-hover:border-emerald-500'
                      }`}>
                        {selectedAnswer !== null && isCorrect && <CheckCircle2 size={16} />}
                        {selectedAnswer !== null && isSelected && !isCorrect && <XCircle size={16} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="mt-8 pt-8 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                  {quiz[currentQuestion].explanation && (
                    <div className="bg-slate-50 p-6 rounded-2xl mb-6 text-sm text-slate-600 font-medium leading-relaxed">
                      <div className="flex items-center justify-end gap-2 mb-2 text-slate-400">
                        <span className="font-black uppercase tracking-tighter">التوضيح</span>
                        <Info size={14} />
                      </div>
                      {quiz[currentQuestion].explanation}
                    </div>
                  )}
                  <button 
                    onClick={handleNextQuestion}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    {currentQuestion + 1 < quiz.length ? 'السؤال التالي' : 'عرض النتيجة'}
                    <ChevronLeft size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === AppTab.METERS && (
        <div className="space-y-6 animate-in fade-in duration-500 text-right">
          <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-800/30 rounded-full -ml-32 -mt-32 blur-3xl pointer-events-none" />
             <div className="relative">
                <h2 className="text-3xl font-black mb-3 flex items-center justify-end gap-3">
                  مكتبة بحور الشعر
                  <Library className="text-emerald-300" />
                </h2>
                <div className="relative mt-4">
                  <input 
                    type="text" 
                    placeholder="ابحث عن بحر أو تفعيلة..." 
                    className="w-full bg-emerald-800/50 border border-emerald-700/50 rounded-2xl p-3 pr-10 text-white placeholder:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    value={meterSearch}
                    onChange={(e) => setMeterSearch(e.target.value)}
                  />
                  <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-300" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMeters.length > 0 ? filteredMeters.map((meter, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 hover:border-emerald-200 transition-all group shadow-sm hover:shadow-md overflow-hidden flex flex-col animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-full border border-emerald-100">
                      {meter.circle}
                    </span>
                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                      بحر {meter.name}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <span className="block text-[10px] text-slate-400 font-black mb-1 uppercase tracking-tighter">مفتاح البحر:</span>
                      <p className="poetry-font text-lg text-slate-700 leading-relaxed">
                        {meter.key}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {meter.tafila.split(' ').map((t, i) => (
                        <span key={i} className="text-[10px] font-bold bg-white px-2 py-0.5 border border-slate-100 rounded-lg text-slate-500">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setSelectedMeter(meter.name);
                      setActiveTab(AppTab.TOOLS);
                      setToolTab('writer');
                    }}
                    className="flex-1 py-3 bg-emerald-50/20 text-emerald-600 font-bold text-xs hover:bg-emerald-100/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <PenTool size={14} /> نظم عليه
                  </button>
                  <button 
                    onClick={() => setExpandedMeterIdx(expandedMeterIdx === idx ? null : idx)}
                    className="flex-1 py-3 bg-slate-50/50 flex items-center justify-center gap-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all font-bold text-xs border-r border-slate-100"
                  >
                    {expandedMeterIdx === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {expandedMeterIdx === idx ? 'إخفاء' : 'عرض التفاصيل'}
                  </button>
                </div>

                {expandedMeterIdx === idx && (
                  <div className="p-6 bg-emerald-50/30 border-t border-emerald-100 animate-in slide-in-from-top-2 duration-300 space-y-6">
                    <div className="bg-white/60 p-5 rounded-2xl border border-emerald-100 shadow-sm">
                      <div className="flex items-center justify-end gap-2 mb-2 text-emerald-800">
                        <span className="text-xs font-black uppercase tracking-widest">إيقاع البحر وطابعه</span>
                        <Music size={14} />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed text-right font-medium">
                        {meter.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-end gap-2 mb-2 text-emerald-700">
                        <span className="text-xs font-black uppercase tracking-widest">أبيات من هذا البحر</span>
                        <Quote size={14} />
                      </div>
                      <div className="space-y-4">
                        {meter.examples.map((example, eIdx) => (
                          <div key={eIdx} className="relative p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm group/verse">
                             <p className="poetry-font text-xl text-slate-800 leading-relaxed text-right">
                               {example}
                             </p>
                             <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover/verse:opacity-100 transition-opacity">
                               <button 
                                onClick={() => {
                                  setVerseInput(example);
                                  setActiveTab(AppTab.ANALYZER);
                                  handleAnalyze(example);
                                }}
                                className="p-1.5 text-slate-300 hover:text-emerald-600 bg-white rounded-lg shadow-sm border border-slate-100"
                                title="تحليل عروضي"
                               >
                                 <ExternalLink size={12} />
                               </button>
                               <button 
                                onClick={() => copyToClipboard(example)}
                                className="p-1.5 text-slate-300 hover:text-emerald-600 bg-white rounded-lg shadow-sm border border-slate-100"
                                title="نسخ"
                               >
                                 <Copy size={12} />
                               </button>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="col-span-full py-12 text-center">
                <Library size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">عذراً، لا توجد نتائج تطابق بحثك</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-[2rem] text-center">
             <div className="flex items-center justify-center gap-2 mb-2 text-emerald-400">
                <BookOpen size={20} />
                <span className="font-black text-sm uppercase tracking-widest">إضاءة عروضية</span>
             </div>
             <p className="text-sm opacity-80 leading-relaxed max-w-md mx-auto">
               البحر "المتدارك" أو "المحدث" هو الذي زاده الأخفش على بحور الخليل الخمسة عشر الأصلية.
             </p>
          </div>
        </div>
      )}

      {activeTab === AppTab.TOOLS && (
        <div className="space-y-6 animate-in fade-in duration-500 text-right">
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm mb-4">
            <button 
              onClick={() => setToolTab('writer')}
              className={`flex-1 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${toolTab === 'writer' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <PenTool size={18} />
              كاتب الشعر
            </button>
            <button 
              onClick={() => setToolTab('rhymes')}
              className={`flex-1 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${toolTab === 'rhymes' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Hash size={18} />
              قاموس القوافي
            </button>
          </div>

          {toolTab === 'writer' ? (
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-end gap-2">
                توليد الشعر بالذكاء الاصطناعي
                <PenTool className="text-emerald-600" />
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">عن ماذا تريد الكتابة؟</label>
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-right" placeholder="مثال: حب الوطن، الشوق..." value={toolPrompt} onChange={(e) => setToolPrompt(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">اختر البحر الشعري</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-right appearance-none font-bold text-slate-700" value={selectedMeter} onChange={(e) => setSelectedMeter(e.target.value)}>
                    {arabicMeters.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <button onClick={handleToolAction} disabled={isLoading || !toolPrompt} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                  {isLoading ? <RefreshCw className="animate-spin" /> : <Sparkles size={18} />}
                  {isLoading ? 'جاري النظم...' : 'توليد بيت شعري موزون'}
                </button>
              </div>
              {generatedVerse && (
                <div className="mt-8 bg-emerald-900 p-10 rounded-[2rem] text-center text-white shadow-xl animate-in zoom-in group relative">
                  <p className="poetry-font text-3xl leading-relaxed mb-6">{generatedVerse}</p>
                  <div className="flex justify-center gap-3">
                    <div className="inline-block px-4 py-1 bg-emerald-800 rounded-full text-xs font-bold border border-emerald-700">بحر {selectedMeter}</div>
                    <button onClick={() => copyToClipboard(generatedVerse)} className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 transition-colors" title="نسخ">
                       <Copy size={14} />
                    </button>
                    <button onClick={() => {
                        setVerseInput(generatedVerse);
                        setActiveTab(AppTab.ANALYZER);
                        handleAnalyze(generatedVerse);
                    }} className="p-2 bg-emerald-800 rounded-lg hover:bg-emerald-700 transition-colors" title="تحليل البيت">
                       <Search size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-left-4 duration-300">
               <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center justify-end gap-2">
                البحث عن قافية
                <Search className="text-emerald-600" />
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2">كلمة القافية</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleRhymeSearch}
                      disabled={isLoading || !rhymeInput}
                      className="bg-emerald-600 text-white px-5 rounded-2xl hover:bg-emerald-700 transition-colors disabled:bg-slate-300 shadow-md active:scale-95"
                    >
                      {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                    <input 
                      className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-right font-bold text-lg" 
                      placeholder="اكتب الكلمة هنا..." 
                      value={rhymeInput} 
                      onChange={(e) => setRhymeInput(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              {rhymes.length > 0 && (
                <div className="mt-8">
                   <span className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-widest border-r-4 border-emerald-500 pr-3">نتائج البحث</span>
                   <div className="flex flex-wrap gap-2 justify-end">
                      {rhymes.map((r, i) => (
                        <div key={i} 
                             onClick={() => copyToClipboard(r)}
                             className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer animate-in zoom-in group relative" 
                             style={{ animationDelay: `${i * 30}ms` }}>
                          <span className="relative z-10">{r}</span>
                          <Copy size={10} className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === AppTab.ABOUT && (
        <div className="space-y-6 animate-in fade-in duration-500 text-right">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-br-full -ml-16 -mt-16 opacity-50 pointer-events-none" />
            
            <div className="flex flex-col items-center mb-10">
              <div className="bg-emerald-100 p-4 rounded-[2rem] mb-6 shadow-inner shadow-emerald-200">
                <Sparkles size={48} className="text-emerald-600" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">عروضي AI</h2>
              <div className="h-1.5 w-20 bg-emerald-500 rounded-full" />
            </div>

            <div className="prose prose-emerald text-slate-600 text-lg leading-relaxed space-y-6 text-center">
              <p className="max-w-xl mx-auto font-medium">
                تطبيق ثوري يدمج بين بلاغة الشعر العربي وعظمة علم العروض، وبين ذكاء التكنولوجيا المعاصرة، ليقدم تجربة فريدة في تحليل ونظم الشعر.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6">
                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2">
                  <BrainCircuit className="text-emerald-600" />
                  <span className="font-black text-xs text-slate-700">تحليل ذكي</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2">
                  <Star className="text-emerald-600" />
                  <span className="font-black text-xs text-slate-700">دقة عالية</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center gap-2">
                  <PenTool className="text-emerald-600" />
                  <span className="font-black text-xs text-slate-700">نظم إبداعي</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 mt-6 flex items-center flex-row-reverse gap-4 text-right">
                <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700"><User size={32} /></div>
                <div>
                  <h4 className="font-bold text-emerald-900">فريق العمل</h4>
                  <p className="text-emerald-800 font-semibold">تصميم وبرمجة: دكتور. أحمد حمدي عاشور الغول</p>
                  <p className="text-[10px] text-emerald-600 font-black uppercase mt-1">متخصص في تقنيات الذكاء الاصطناعي واللغة</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-8">
            © {new Date().getFullYear()} جميع الحقوق محفوظة لـ دكتور. أحمد حمدي عاشور الغول <br />Arudi AI - Release 1.0.0
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
