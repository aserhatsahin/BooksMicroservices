import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGenres, createGenre, updateGenre, deleteGenre } from '../api/genresApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon } from '../components/Icons';
import type { GenreResponse } from '../types';

const emptyForm = { name: '' };

const genreColors = [
  { light: 'bg-blue-50 border-blue-200',     text: 'text-blue-700',    dot: 'bg-blue-500'    },
  { light: 'bg-violet-50 border-violet-200', text: 'text-violet-700',  dot: 'bg-violet-500'  },
  { light: 'bg-rose-50 border-rose-200',     text: 'text-rose-700',    dot: 'bg-rose-500'    },
  { light: 'bg-amber-50 border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  { light: 'bg-emerald-50 border-emerald-200',text:'text-emerald-700', dot: 'bg-emerald-500' },
  { light: 'bg-cyan-50 border-cyan-200',     text: 'text-cyan-700',    dot: 'bg-cyan-500'    },
  { light: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700',  dot: 'bg-indigo-500'  },
  { light: 'bg-pink-50 border-pink-200',     text: 'text-pink-700',    dot: 'bg-pink-500'    },
];
const getColor = (name: string) => genreColors[name.charCodeAt(0) % genreColors.length];

const GenreSkeleton = () => <div className="h-20 rounded-2xl shimmer" />;

export const GenresPage = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm]                 = useState(emptyForm);
  const [editId, setEditId]             = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GenreResponse | null>(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [toast, setToast]               = useState('');
  const [toastType, setToastType]       = useState<'success' | 'error'>('success');

  const { data: genres = [], isLoading } = useQuery({ queryKey: ['genres'], queryFn: getGenres });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editId ? updateGenre({ ...data, id: editId }) : createGenre(data),
    onSuccess: (res) => {
      if (res.data.isSuccessful) {
        queryClient.invalidateQueries({ queryKey: ['genres'] });
        showToast(res.data.message);
        setModalOpen(false);
      } else {
        showToast(res.data.message, 'error');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteGenre(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      showToast(res.data.message);
      setDeleteTarget(null);
    },
  });

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (g: GenreResponse) => { setForm({ name: g.name }); setEditId(g.id); setModalOpen(true); };

  return (
    <div className="animate-fade-in">
      <PageHeader
        section="Library"
        title="Genres"
        subtitle={`${genres.length} genre${genres.length !== 1 ? 's' : ''} available`}
        action={isAdmin && (
          <button onClick={openAdd} className="btn btn-primary btn-sm gap-1.5">
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5"><PlusIcon /></span> Add Genre
          </button>
        )}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => <GenreSkeleton key={i} />)}
        </div>
      ) : genres.length === 0 ? (
        <EmptyState icon={<TagIcon />} title="No genres yet" subtitle="Add your first genre to get started" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 stagger">
          {genres.map((g, i) => {
            const c = getColor(g.name);
            return (
              <div
                key={g.id}
                className={`group relative ${c.light} border rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                  <span className={`font-bold text-sm ${c.text}`}>{g.name}</span>
                </div>

                {isAdmin && (
                  <div className="absolute inset-x-0 bottom-0 flex border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-b-2xl overflow-hidden">
                    <button
                      onClick={() => openEdit(g)}
                      className="flex-1 py-1.5 text-xs text-base-content/50 hover:text-base-content hover:bg-black/5 transition-colors flex items-center justify-center gap-1 [&>svg]:w-3 [&>svg]:h-3"
                    >
                      <PencilIcon /> Edit
                    </button>
                    <div className="w-px bg-black/5" />
                    <button
                      onClick={() => setDeleteTarget(g)}
                      className="flex-1 py-1.5 text-xs text-error/60 hover:text-error hover:bg-error/5 transition-colors flex items-center justify-center gap-1 [&>svg]:w-3 [&>svg]:h-3"
                    >
                      <TrashIcon /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Genre' : 'Add New Genre'}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.name.trim()}
            >
              {saveMutation.isPending ? <><span className="loading loading-spinner loading-xs" />Saving…</> : 'Save Genre'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Genre Name *</label>
          <input
            className="input input-bordered w-full text-sm"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            placeholder="e.g. Science Fiction"
            autoFocus
          />
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Genre"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-error btn-sm" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-base-content/60">Delete genre <strong className="text-base-content">{deleteTarget?.name}</strong>? This cannot be undone.</p>
      </Modal>

      <Toast message={toast} type={toastType} />
    </div>
  );
};
