import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { getConfig, updateConfig, type Config } from '../lib/api';
import { Loader2, Save, X } from 'lucide-react';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
    const [config, setConfig] = useState<Partial<Config>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'prompts'>('general');

    useEffect(() => {
        if (isOpen) {
            loadConfig();
        }
    }, [isOpen]);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const data = await getConfig();
            setConfig(data);
        } catch (error) {
            console.error("Failed to load config", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateConfig(config);
            onClose();
            alert("Settings saved successfully. Backend configuration updated.");
        } catch (error) {
            console.error("Failed to save config", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
                    <CardTitle>Settings</CardTitle>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </CardHeader>

                <div className="flex border-b px-6">
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'prompts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('prompts')}
                    >
                        Prompts
                    </button>
                </div>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-900">AI Provider</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-500">Provider (volcengine / openai)</label>
                                                <Input
                                                    value={config.AI_PROVIDER || ''}
                                                    onChange={e => setConfig({ ...config, AI_PROVIDER: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-900">Volcengine (Ark)</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-500">API Key</label>
                                                <Input
                                                    type="password"
                                                    value={config.VOLC_API_KEY || ''}
                                                    onChange={e => setConfig({ ...config, VOLC_API_KEY: e.target.value })}
                                                    placeholder="Masked"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-500">Model ID (Endpoint ID)</label>
                                                <Input
                                                    value={config.VOLC_MODEL || ''}
                                                    onChange={e => setConfig({ ...config, VOLC_MODEL: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-xs font-medium text-gray-500">Base URL</label>
                                                <Input
                                                    value={config.VOLC_BASE_URL || ''}
                                                    onChange={e => setConfig({ ...config, VOLC_BASE_URL: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-900">GitCode & GitHub</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-500">GitCode Access Token</label>
                                                <Input
                                                    type="password"
                                                    value={config.GITCODE_ACCESS_TOKEN || ''}
                                                    onChange={e => setConfig({ ...config, GITCODE_ACCESS_TOKEN: e.target.value })}
                                                    placeholder="Masked"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-gray-500">GitHub Access Token</label>
                                                <Input
                                                    type="password"
                                                    value={config.GITHUB_ACCESS_TOKEN || ''}
                                                    onChange={e => setConfig({ ...config, GITHUB_ACCESS_TOKEN: e.target.value })}
                                                    placeholder="Masked"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'prompts' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">System Prompt</label>
                                        <p className="text-xs text-gray-500">
                                            This prompt instructs the AI on how to review the code. You can use placeholders: {'{title}'}, {'{description}'}, {'{author}'}, {'{diff_content}'}.
                                        </p>
                                        <Textarea
                                            className="min-h-[300px] font-mono text-sm"
                                            value={config.SYSTEM_PROMPT || ''}
                                            onChange={e => setConfig({ ...config, SYSTEM_PROMPT: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>

                <div className="border-t p-6 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </Card>
        </div>
    );
}
