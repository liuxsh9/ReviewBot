import { useState, useEffect } from 'react'
import { Plus, Loader2, GitCommit, Settings, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { createReview, listReviews, deleteReview, type ReviewResponse } from '../lib/api'
import { Settings as SettingsModal } from '../components/Settings'

export default function Dashboard() {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [reviews, setReviews] = useState<ReviewResponse[]>([])
    const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    useEffect(() => {
        fetchReviews()
    }, [])

    const fetchReviews = async () => {
        try {
            const data = await listReviews()
            setReviews(data)
            if (data.length > 0 && !selectedReview) {
                setSelectedReview(data[0])
            }
        } catch (e) {
            console.error("Failed to fetch reviews", e)
        }
    }

    const handleReview = async () => {
        if (!url) return
        setLoading(true)
        try {
            const newReview = await createReview(url)
            setReviews([newReview, ...reviews])
            setSelectedReview(newReview)
            setUrl('')
            // Start polling for result
            pollReview(newReview.id)
        } catch (e) {
            console.error(e)
            alert("Failed to start review")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await deleteReview(id);
            const updated = reviews.filter(r => r.id !== id);
            setReviews(updated);
            if (selectedReview?.id === id) {
                setSelectedReview(updated.length > 0 ? updated[0] : null);
            }
        } catch (error) {
            console.error("Failed to delete review", error);
            alert("Failed to delete review");
        }
    }

    const pollReview = async (id: number) => {
        const interval = setInterval(async () => {
            try {
                // We need a getReview(id) but listReviews is also fine for now or implementation of getReview
                const data = await listReviews()
                const updated = data.find(r => r.id === id)
                if (updated && updated.status !== 'pending') {
                    clearInterval(interval)
                    // Only update if the list hasn't changed drastically or handle merge?
                    // Simple re-fetch is safer for now.
                    setReviews(data)
                    // Keep selection if it was this one
                    if (selectedReview?.id === id) {
                        setSelectedReview(updated)
                    }
                }
            } catch (e) {
                clearInterval(interval)
            }
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                        <GitCommit size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">ReviewBot</h1>
                </div>
                <div>
                    <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2">
                        <Settings size={16} />
                        Settings
                    </Button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Sidebar: Review History/Input */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Review</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Paste GitCode/GitHub PR URL..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleReview} disabled={loading || !url}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Start AI Review
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="h-[calc(100vh-22rem)] overflow-hidden flex flex-col">
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-2 p-4 pt-0">
                            {reviews.map(review => (
                                <div
                                    key={review.id}
                                    onClick={() => setSelectedReview(review)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm group ${selectedReview?.id === review.id
                                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <p className="text-xs font-mono text-gray-500 truncate flex-1">{review.pr_url}</p>
                                        <button
                                            onClick={(e) => handleDelete(e, review.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete Review"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            review.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {review.status}
                                        </span>
                                        <span className="text-xs text-gray-400">#{review.id}</span>
                                    </div>
                                </div>
                            ))}
                            {reviews.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    No reviews yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content: Review Result */}
                <div className="md:col-span-2">
                    {selectedReview ? (
                        <Card className="h-full flex flex-col overflow-hidden">
                            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                                <CardTitle className="flex items-center gap-2">
                                    Review Result
                                    {selectedReview.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                </CardTitle>
                                <div className="text-sm text-gray-500 truncate max-w-lg">
                                    {selectedReview.pr_url}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none">
                                {selectedReview.status === 'completed' && selectedReview.result ? (
                                    <ReactMarkdown>{selectedReview.result}</ReactMarkdown>
                                ) : selectedReview.status === 'failed' ? (
                                    <div className="text-red-500 bg-red-50 p-4 rounded-md">
                                        Error: {selectedReview.result || "Unknown error"}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                        <p>AI is analyzing the changes...</p>
                                        <p className="text-xs max-w-xs text-center text-gray-300">This may take a minute depending on the size of the diff.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-white rounded-xl border border-gray-200 border-dashed">
                            Select a review to view details
                        </div>
                    )}
                </div>

                <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            </main>
        </div>
    )
}
