import React, { useState } from 'react';
import { X, Moon, Sun, Laptop, Globe, Cpu, User, CreditCard, Shield, Volume2, Sparkles, Check, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { translations, Language } from '@/i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (newTheme: 'light' | 'dark' | 'system') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  defaultModel: string;
  onModelChange: (model: string) => void;
  onExportData: () => void;
  onClearData: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  language,
  onLanguageChange,
  defaultModel,
  onModelChange,
  onExportData,
  onClearData
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'models' | 'audio' | 'account' | 'data'>('general');
  const [autoCite, setAutoCite] = useState(true);
  const [autoQuiz, setAutoQuiz] = useState(false);
  const [voice, setVoice] = useState('rachel');
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;
  const t = translations[language] || translations.en;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 rounded-3xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[460px] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Left Settings Navigation Bar */}
        <div className="w-full md:w-52 bg-gray-50/80 dark:bg-zinc-950/80 border-r border-gray-200/80 dark:border-zinc-800 p-3 space-y-1 shrink-0">
          <div className="px-3 py-2 text-xs font-bold tracking-tight text-gray-400 dark:text-zinc-500 uppercase">
            {t.settingsTitle}
          </div>

          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Sun className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            {t.generalTheme}
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'models'
                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Cpu className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            {t.aiModel}
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'audio'
                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Volume2 className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            {t.audioSpeech}
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'account'
                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <CreditCard className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            {t.accountPlan}
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'data'
                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Shield className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
            {t.dataControls}
          </button>
        </div>

        {/* Right Settings Content Area */}
        <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                {activeTab === 'general' && t.generalTheme}
                {activeTab === 'models' && t.aiModel}
                {activeTab === 'audio' && t.audioSpeech}
                {activeTab === 'account' && t.accountPlan}
                {activeTab === 'data' && t.dataControls}
              </h3>
              <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: GENERAL & THEME */}
            {activeTab === 'general' && (
              <div className="space-y-6 text-xs">
                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="font-semibold text-gray-900 dark:text-white text-xs block">{t.themeApp}</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => onThemeChange('light')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        theme === 'light'
                          ? 'border-gray-900 bg-gray-50 dark:bg-zinc-800 text-gray-900 font-semibold shadow-2xs'
                          : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>{t.light}</span>
                      </div>
                      {theme === 'light' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => onThemeChange('dark')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        theme === 'dark'
                          ? 'border-gray-900 dark:border-zinc-100 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold shadow-2xs'
                          : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span>{t.dark}</span>
                      </div>
                      {theme === 'dark' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>

                    <button
                      onClick={() => onThemeChange('system')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        theme === 'system'
                          ? 'border-gray-900 dark:border-zinc-100 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold shadow-2xs'
                          : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-gray-500" />
                        <span>{t.system}</span>
                      </div>
                      {theme === 'system' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  </div>
                </div>

                {/* Language Selector */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                  <label className="font-semibold text-gray-900 dark:text-white text-xs block">{t.interfaceLang}</label>
                  <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value as Language)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="en">English (US)</option>
                    <option value="ko">한국어 (Korean)</option>
                    <option value="es">Español (Spanish)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 2: AI & MODEL */}
            {activeTab === 'models' && (
              <div className="space-y-6 text-xs">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-900 dark:text-white text-xs block">{t.defaultEngine}</label>
                  <select
                    value={defaultModel}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="GPT-5 / Llama 3.1">GPT-5 / LLaMA 3.3 70B (Versatile & Precise)</option>
                    <option value="GPT-4o">GPT-4o (Fast & High Intelligence)</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Advanced Reasoning)</option>
                  </select>
                  <p className="text-2xs text-gray-400 dark:text-zinc-500">
                    {t.modelDesc}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{t.strictGrounding}</div>
                      <div className="text-2xs text-gray-500 dark:text-zinc-400">{t.strictDesc}</div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={autoCite} 
                      onChange={(e) => setAutoCite(e.target.checked)} 
                      className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{t.autoQuizUpload}</div>
                      <div className="text-2xs text-gray-500 dark:text-zinc-400">{t.autoQuizDesc}</div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={autoQuiz} 
                      onChange={(e) => setAutoQuiz(e.target.checked)} 
                      className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO & SPEECH */}
            {activeTab === 'audio' && (
              <div className="space-y-6 text-xs">
                <div className="space-y-2">
                  <label className="font-semibold text-gray-900 dark:text-white text-xs block">{t.voiceModel}</label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="rachel">ElevenLabs Neural — Rachel & Adam (Two Speakers)</option>
                    <option value="nicole">ElevenLabs Neural — Nicole & Marcus (Discussion)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t.readAloudFx}</div>
                    <div className="text-2xs text-gray-500 dark:text-zinc-400">{t.soundFxDesc}</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={soundEnabled} 
                    onChange={(e) => setSoundEnabled(e.target.checked)} 
                    className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: ACCOUNT & PLAN */}
            {activeTab === 'account' && (
              <div className="space-y-6 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-emerald-950 dark:text-emerald-300 text-sm">{t.unlimitedPlan}</div>
                    <div className="text-2xs text-emerald-700 dark:text-emerald-400 mt-0.5">{t.activeSub}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-semibold text-2xs">
                    {t.activeBadge}
                  </span>
                </div>

                <Button className="w-full bg-gray-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-gray-800 text-white rounded-xl text-xs py-2">
                  {t.manageSub}
                </Button>
              </div>
            )}

            {/* TAB 5: DATA CONTROLS */}
            {activeTab === 'data' && (
              <div className="space-y-6 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-zinc-800">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{t.exportData}</div>
                      <div className="text-2xs text-gray-500 dark:text-zinc-400">{t.exportDesc}</div>
                    </div>
                    <Button onClick={onExportData} size="sm" variant="outline" className="rounded-xl border-gray-200 text-xs">
                      <Download className="w-3.5 h-3.5 mr-1" /> {t.exportBtn}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20">
                    <div>
                      <div className="font-semibold text-rose-900 dark:text-rose-300">{t.clearHistory}</div>
                      <div className="text-2xs text-rose-700 dark:text-rose-400">{t.clearDesc}</div>
                    </div>
                    <Button onClick={onClearData} size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs">
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> {t.clearDataBtn}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800 mt-6">
            <Button onClick={onClose} className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white px-6 text-xs">
              {t.done}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
