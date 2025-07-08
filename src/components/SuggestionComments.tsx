import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Send, User, X, ChevronUp } from "lucide-react";
import { useSuggestions } from "@/hooks/useSuggestions";
import { useCommentCount } from "@/hooks/useCommentCount";
import { useCommentRefresh } from "@/contexts/CommentRefreshContext";

interface SuggestionComment {
  id: string;
  suggestion_id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface SuggestionCommentsProps {
  suggestionId: string;
}

const SuggestionComments = ({ suggestionId }: SuggestionCommentsProps) => {
  const [comments, setComments] = useState<SuggestionComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchComments, addComment } = useSuggestions();
  const { triggerRefresh } = useCommentRefresh();
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);

  const commentCount = useCommentCount(suggestionId);

  const loadComments = async () => {
    if (showComments && comments.length === 0) {
      setLoading(true);
      try {
        const commentsData = await fetchComments(suggestionId);
        setComments(commentsData);
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim()) {
      return;
    }
    setLoading(true);
    try {
      const comment = await addComment({
        suggestion_id: suggestionId,
        author_name: authorName,
        author_email: authorEmail,
        content: newComment,
      });
      if (comment) {
        setComments((prev) => [...prev, comment]);
        setNewComment("");
        triggerRefresh();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setShowComments((prev) => !prev)}
        className="flex items-center gap-2"
      >
        {showComments ? (
          <>
            <ChevronUp className="w-4 h-4" /> Fechar comentários
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" /> Ver comentários ({commentCount})
          </>
        )}
      </Button>

      {showComments && (
        <div className="space-y-6">
          {/* Lista de comentários */}
          {loading && comments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Carregando comentários...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <Card key={comment.id} className="bg-gray-50 dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.author_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Separador visual */}
          <hr className="my-2 border-gray-200 dark:border-gray-700" />

          {/* Botão para abrir o formulário de novo comentário */}
          {!showNewCommentForm && (
            <Button
              variant="outline"
              onClick={() => setShowNewCommentForm(true)}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Adicionar novo comentário
            </Button>
          )}

          {/* Formulário para novo comentário */}
          {showNewCommentForm && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <form onSubmit={handleSubmitComment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Seu nome" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
                    <Input type="email" placeholder="Seu email" value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} required />
                  </div>
                  <Textarea
                    placeholder="Escreva seu comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                    required
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={loading || !newComment.trim() || !authorName.trim() || !authorEmail.trim()}
                      className="flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {loading ? "Enviando..." : "Comentar"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowNewCommentForm(false)}
                    >
                      Fechar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionComments;
