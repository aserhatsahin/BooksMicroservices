import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooks, createBook, updateBook, deleteBook } from '../api/booksApi';
import { getAuthors } from '../api/authorsApi';
import { getGenres } from '../api/genresApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { StatCard } from '../components/StatCard';
import { Toast } from '../components/Toast';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { BookIcon, StarIcon, PenIcon, TagIcon, PlusIcon, PencilIcon, TrashIcon } from '../components/Icons';
import type { BookResponse, BookCreateRequest } from '../types';

const emptyForm: BookCreateRequest = {
  name: '', publishDate: null, numberOfPages: null,
  price: 0, isTopSeller: false, authorId: 0, genreIds: [],
};

const coverPalette = [
  { bg: 'from-blue-500 to-blue-700',     text: 'text-blue-100'   },
  { bg: 'from-violet-500 to-violet-700', text: 'text-violet-100' },
  { bg: 'from-rose-500 to-rose-700',     text: 'text-rose-100'   },
  { bg: 'from-amber-500 to-amber-700',   text: 'text-amber-100'  },
  { bg: 'from-emerald-500 to-emerald-700',text:'text-emerald-100'},
  { bg: 'from-cyan-500 to-cyan-700',     text: 'text-cyan-100'   },
  { bg: 'from-indigo-500 to-indigo-700', text: 'text-indigo-100' },
  { bg: 'from-pink-500 to-pink-700',     text: 'text-pink-100'   },
];
const getCover = (name: string) => coverPalette[name.charCodeAt(0) % coverPalette.length];

const BookSkeleton = () => (
  <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
    <div className="h-28 shimmer" />
    <div className="p-4 space-y-2.5">
      <div className="h-3.5 shimmer rounded-lg w-4/5" />
      <div className="h-3 shimmer rounded-lg w-2/5" />
      <div className="flex gap-1.5 mt-3">
        <div className="h-4 w-12 shimmer rounded-full" />
        <div className="h-4 w-16 shimmer rounded-full" />
      </div>
      <div className="flex justify-between mt-3">
        <div className="h-4 w-14 shimmer rounded-lg" />
        <div className="h-3 w-10 shimmer rounded-lg" />
      </div>
    </div>
  </div>
);

export const BooksPage = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm]                 = useState<BookCreateRequest>(emptyForm);
  const [editId, setEditId]             = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookResponse | null>(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [search, setSearch]             = useState('');
  const [toast, setToast]               = useState('');
  const [toastType, setToastType]       = useState<'success' | 'error'>('success');

  const { data: books = [],   isLoading } = useQuery({ queryKey: ['books'],   queryFn: getBooks   });
  const { data: authors = [] }            = useQuery({ queryKey: ['authors'], queryFn: getAuthors });
  const { data: genres = [] }             = useQuery({ queryKey: ['genres'],  queryFn: getGenres  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const saveMutation = useMutation({
    mutationFn: (data: BookCreateRequest) =>
      editId ? updateBook({ ...data, id: editId }) : createBook(data),
    onSuccess: (res) => {
      if (res.data.isSuccessful) { queryClient.invalidateQueries({ queryKey: ['books'] }); showToast(res.data.message); setModalOpen(false); }
      else showToast(res.data.message, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: (res) => { queryClient.invalidateQueries({ queryKey: ['books'] }); showToast(res.data.message); setDeleteTarget(null); },
  });

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (b: BookResponse) => {
    setForm({ name: b.name, publishDate: b.publishDate?.slice(0, 10) ?? null, numberOfPages: b.numberOfPages, price: b.price, isTopSeller: b.isTopSeller, authorId: b.authorId, genreIds: b.genreIds ?? [] });
    setEditId(b.id); setModalOpen(true);
  };
  const toggleGenre = (id: number) =>
    setForm((f) => ({ ...f, genreIds: f.genreIds.includes(id) ? f.genreIds.filter((g) => g !== id) : [...f.genreIds, id] }));

  const topSellers = books.filter((b) => b.isTopSeller).length;
  const filtered   = books.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || b.authorF?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <PageHeader
        section="Library"
        title="Book Catalog"
        subtitle={`${books.length} books in the collection`}
        action={isAdmin && (
          <button onClick={openAdd} className="btn btn-primary btn-sm gap-1.5">
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5"><PlusIcon /></span> Add Book
          </button>
        )}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger">
        <StatCard label="Total Books"  value={books.length}   icon={<BookIcon />} iconBg="bg-blue-100"    iconColor="text-blue-600"    />
        <StatCard label="Top Sellers"  value={topSellers}     icon={<StarIcon />} iconBg="bg-amber-100"   iconColor="text-amber-600"   />
        <StatCard label="Authors"      value={authors.length} icon={<PenIcon />}  iconBg="bg-violet-100"  iconColor="text-violet-600"  />
        <StatCard label="Genres"       value={genres.length}  icon={<TagIcon />}  iconBg="bg-emerald-100" iconColor="text-emerald-600" />
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or author…" />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <BookSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<BookIcon />} title="No books found" subtitle={search ? 'Try a different search term' : 'Add your first book to get started'} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
          {filtered.map((b) => {
            const cover = getCover(b.name);
            return (
              <div key={b.id} className="group bg-base-100 rounded-2xl border border-base-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up flex flex-col">
                {/* Cover */}
                <div className={`relative h-28 bg-gradient-to-br ${cover.bg} flex flex-col justify-between p-3.5`}>
                  <div className="flex justify-between items-start">
                    <div className={`w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center font-black text-base text-white`}>
                      {b.name[0]}
                    </div>
                    {b.isTopSeller && (
                      <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Top Seller
                      </span>
                    )}
                  </div>
                  <p className={`text-xs font-semibold ${cover.text} opacity-75 truncate`}>{b.authorF}</p>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-sm text-base-content leading-snug line-clamp-2 mb-2">{b.name}</h3>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {b.genresF?.split(',').filter(Boolean).map((g) => (
                      <span key={g} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-base-200 text-base-content/50 uppercase tracking-wide">
                        {g.trim()}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-base-200 pt-3">
                    <span className="font-black text-base text-primary tracking-tight">{b.priceF}</span>
                    {b.numberOfPages && <span className="text-[10px] text-base-content/30 font-bold uppercase tracking-wider">{b.numberOfPages} pp</span>}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                      <button onClick={() => openEdit(b)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-base-200 hover:bg-base-300 text-base-content/60 hover:text-base-content transition-colors [&>svg]:w-3 [&>svg]:h-3">
                        <PencilIcon /> Edit
                      </button>
                      <button onClick={() => setDeleteTarget(b)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold bg-error/8 hover:bg-error/15 text-error/60 hover:text-error transition-colors [&>svg]:w-3 [&>svg]:h-3">
                        <TrashIcon /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Book' : 'Add New Book'} size="lg"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name.trim() || !form.authorId}>
              {saveMutation.isPending ? <><span className="loading loading-spinner loading-xs" />Saving…</> : 'Save Book'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Title *</label>
            <input className="input input-bordered w-full text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Book title" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Author *</label>
            <select className="select select-bordered w-full text-sm" value={form.authorId} onChange={(e) => setForm({ ...form, authorId: Number(e.target.value) })}>
              <option value={0}>Select author…</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Price</label>
            <input type="number" step="0.01" className="input input-bordered w-full text-sm" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Publish Date</label>
            <input type="date" className="input input-bordered w-full text-sm" value={form.publishDate ?? ''} onChange={(e) => setForm({ ...form, publishDate: e.target.value || null })} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Pages</label>
            <input type="number" className="input input-bordered w-full text-sm" value={form.numberOfPages ?? ''} onChange={(e) => setForm({ ...form, numberOfPages: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <label key={g.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer text-sm font-semibold transition-all duration-150 select-none ${form.genreIds.includes(g.id) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-base-200 border-transparent text-base-content/50 hover:border-base-300 hover:text-base-content/70'}`}>
                  <input type="checkbox" className="hidden" checked={form.genreIds.includes(g.id)} onChange={() => toggleGenre(g.id)} />
                  {g.name}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <button type="button" onClick={() => setForm({ ...form, isTopSeller: !form.isTopSeller })}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 w-full text-left transition-all duration-200 ${form.isTopSeller ? 'border-amber-300 bg-amber-50' : 'border-base-200 bg-base-100 hover:border-base-300'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all [&>svg]:w-4 [&>svg]:h-4 ${form.isTopSeller ? 'bg-amber-400 text-white shadow-md shadow-amber-200' : 'bg-base-200 text-base-content/30'}`}>
                <StarIcon />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">Top Seller</div>
                <div className="text-xs text-base-content/40">Feature this book prominently</div>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 ${form.isTopSeller ? 'bg-amber-400' : 'bg-base-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${form.isTopSeller ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Book" size="sm"
        footer={<><button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="btn btn-error btn-sm" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? 'Deleting…' : 'Delete'}</button></>}>
        <p className="text-sm text-base-content/60">Delete <strong className="text-base-content">{deleteTarget?.name}</strong>? This cannot be undone.</p>
      </Modal>

      <Toast message={toast} type={toastType} />
    </div>
  );
};
