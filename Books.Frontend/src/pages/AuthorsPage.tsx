import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from '../api/authorsApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { PlusIcon, PencilIcon, TrashIcon, PenIcon } from '../components/Icons';
import type { AuthorResponse } from '../types';

const emptyForm = { firstName: '', lastName: '' };

const avatarPalette = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
  'from-emerald-500 to-emerald-700',
  'from-cyan-500 to-cyan-700',
  'from-indigo-500 to-indigo-700',
  'from-pink-500 to-pink-700',
];
const getGradient = (name: string) => avatarPalette[name.charCodeAt(0) % avatarPalette.length];

const AuthorSkeleton = () => (
  <tr className="border-b border-base-200/60 last:border-0">
    <td className="py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full shimmer shrink-0" />
        <div className="h-3 w-28 shimmer rounded-lg" />
      </div>
    </td>
    <td className="py-3"><div className="h-5 w-7 shimmer rounded-full" /></td>
    <td className="py-3 hidden md:table-cell"><div className="h-3 w-40 shimmer rounded-lg" /></td>
    <td className="py-3" />
  </tr>
);

export const AuthorsPage = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm]                 = useState(emptyForm);
  const [editId, setEditId]             = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuthorResponse | null>(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [search, setSearch]             = useState('');
  const [toast, setToast]               = useState('');
  const [toastType, setToastType]       = useState<'success' | 'error'>('success');

  const { data: authors = [], isLoading } = useQuery({ queryKey: ['authors'], queryFn: getAuthors });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editId ? updateAuthor({ ...data, id: editId }) : createAuthor(data),
    onSuccess: (res) => {
      if (res.data.isSuccessful) {
        queryClient.invalidateQueries({ queryKey: ['authors'] });
        showToast(res.data.message);
        setModalOpen(false);
      } else {
        showToast(res.data.message, 'error');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAuthor(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      showToast(res.data.message);
      setDeleteTarget(null);
    },
  });

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (a: AuthorResponse) => {
    setForm({ firstName: a.firstName, lastName: a.lastName });
    setEditId(a.id);
    setModalOpen(true);
  };

  const filtered = authors.filter((a) =>
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const tableHead = (
    <thead>
      <tr className="bg-base-200/50 border-b border-base-200">
        <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-3">Author</th>
        <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-3">Books</th>
        <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-3 hidden md:table-cell">Titles</th>
        {isAdmin && <th />}
      </tr>
    </thead>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        section="Library"
        title="Authors"
        subtitle={`${authors.length} author${authors.length !== 1 ? 's' : ''} in the library`}
        action={isAdmin && (
          <button onClick={openAdd} className="btn btn-primary btn-sm gap-1.5">
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5"><PlusIcon /></span> Add Author
          </button>
        )}
      />

      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search authors…" />
      </div>

      {isLoading ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
          <table className="table w-full">
            {tableHead}
            <tbody>{Array.from({ length: 5 }).map((_, i) => <AuthorSkeleton key={i} />)}</tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<PenIcon />} title="No authors found" subtitle={search ? 'Try a different search term' : 'Add your first author to get started'} />
      ) : (
        <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
          <table className="table w-full">
            {tableHead}
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className="border-b border-base-200/60 last:border-0 hover:bg-base-200/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 35}ms` }}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(a.firstName)} text-white text-xs font-black flex items-center justify-center shrink-0`}>
                        {a.firstName[0]}{a.lastName[0]}
                      </div>
                      <span className="font-semibold text-sm text-base-content">{a.firstName} {a.lastName}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-base-200 text-xs font-black text-base-content/60">
                      {a.booksCount}
                    </span>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <span className="text-xs text-base-content/40 font-medium line-clamp-1">{a.books || '—'}</span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="w-7 h-7 rounded-lg flex items-center justify-center text-base-content/30 hover:text-base-content hover:bg-base-200 transition-colors [&>svg]:w-3.5 [&>svg]:h-3.5">
                          <PencilIcon />
                        </button>
                        <button onClick={() => setDeleteTarget(a)} className="w-7 h-7 rounded-lg flex items-center justify-center text-error/30 hover:text-error hover:bg-error/10 transition-colors [&>svg]:w-3.5 [&>svg]:h-3.5">
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Author' : 'Add New Author'}
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.firstName.trim() || !form.lastName.trim()}
            >
              {saveMutation.isPending ? <><span className="loading loading-spinner loading-xs" />Saving…</> : 'Save Author'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">First Name *</label>
            <input className="input input-bordered w-full text-sm" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Last Name *</label>
            <input className="input input-bordered w-full text-sm" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Author"
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
        <p className="text-sm text-base-content/60">Delete <strong className="text-base-content">{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? This cannot be undone.</p>
      </Modal>

      <Toast message={toast} type={toastType} />
    </div>
  );
};
