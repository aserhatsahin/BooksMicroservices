import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../api/usersApi';
import { getRoles } from '../api/rolesApi';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon } from '../components/Icons';
import type { UserResponse, UserCreateRequest } from '../types';

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

const emptyForm: UserCreateRequest = {
  userName: '', password: '', firstName: '', lastName: '',
  gender: 1, birthDate: null,
  registrationDate: new Date().toISOString().slice(0, 10),
  score: 0, isActive: true,
  address: null, countryId: null, cityId: null, groupId: null,
  roleIds: [],
};

const UserSkeleton = () => (
  <tr className="border-b border-base-200/60 last:border-0">
    <td className="py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full shimmer shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-24 shimmer rounded-lg" />
          <div className="h-2.5 w-16 shimmer rounded-lg" />
        </div>
      </div>
    </td>
    <td className="py-3 hidden sm:table-cell"><div className="h-5 w-16 shimmer rounded-full" /></td>
    <td className="py-3 hidden md:table-cell"><div className="h-3 w-28 shimmer rounded-lg" /></td>
    <td className="py-3"><div className="h-5 w-14 shimmer rounded-full" /></td>
    <td />
  </tr>
);

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm]                 = useState<UserCreateRequest>(emptyForm);
  const [editId, setEditId]             = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [search, setSearch]             = useState('');
  const [toast, setToast]               = useState('');
  const [toastType, setToastType]       = useState<'success' | 'error'>('success');

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const { data: roles = [] }            = useQuery({ queryKey: ['roles'], queryFn: getRoles });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const saveMutation = useMutation({
    mutationFn: (data: UserCreateRequest) =>
      editId ? updateUser({ ...data, id: editId }) : createUser(data),
    onSuccess: (res) => {
      if (res.data.isSuccessful) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        showToast(res.data.message);
        setModalOpen(false);
      } else {
        showToast(res.data.message, 'error');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast(res.data.message);
      setDeleteTarget(null);
    },
  });

  const openAdd  = () => { setForm({ ...emptyForm, registrationDate: new Date().toISOString().slice(0, 10) }); setEditId(null); setModalOpen(true); };
  const openEdit = (u: UserResponse) => {
    setForm({
      userName: u.userName, password: u.password,
      firstName: u.firstName || '', lastName: u.lastName || '',
      gender: u.gender, birthDate: u.birthDate ? u.birthDate.slice(0, 10) : null,
      registrationDate: u.registrationDate.slice(0, 10),
      score: u.score, isActive: u.isActive,
      address: u.address || null,
      countryId: u.countryId, cityId: u.cityId, groupId: u.groupId,
      roleIds: u.roleIds ?? [],
    });
    setEditId(u.id);
    setModalOpen(true);
  };

  const toggleRole = (id: number) =>
    setForm((f) => ({
      ...f,
      roleIds: f.roleIds.includes(id) ? f.roleIds.filter((r) => r !== id) : [...f.roleIds, id],
    }));

  const filtered = users.filter((u) =>
    u.userName.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const tableHead = (
    <thead>
      <tr className="bg-base-200/50 border-b border-base-200">
        <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-3">User</th>
        <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-3 hidden sm:table-cell">Roles</th>
        <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-3 hidden md:table-cell">Registered</th>
        <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-3">Status</th>
        <th />
      </tr>
    </thead>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        section="Access Control"
        title="Users"
        subtitle={`${users.length} user${users.length !== 1 ? 's' : ''} registered`}
        action={
          <button onClick={openAdd} className="btn btn-primary btn-sm gap-1.5">
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5"><PlusIcon /></span> Add User
          </button>
        }
      />

      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users…" />
      </div>

      {isLoading ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
          <table className="table w-full">
            {tableHead}
            <tbody>{Array.from({ length: 4 }).map((_, i) => <UserSkeleton key={i} />)}</tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<UserIcon />} title="No users found" subtitle={search ? 'Try a different search term' : 'Add the first user to get started'} />
      ) : (
        <div className="bg-base-100 rounded-2xl border border-base-200 overflow-hidden">
          <table className="table w-full">
            {tableHead}
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className="border-b border-base-200/60 last:border-0 hover:bg-base-200/30 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 35}ms` }}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(u.userName)} text-white text-xs font-black flex items-center justify-center shrink-0`}>
                        {u.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-base-content">{u.fullName || u.userName}</div>
                        <div className="text-xs text-base-content/40 font-medium">@{u.userName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(u.rolesF ?? []).map((r) => (
                        <span key={r} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">{r}</span>
                      ))}
                      {(!u.rolesF || u.rolesF.length === 0) && <span className="text-xs text-base-content/30">—</span>}
                    </div>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <span className="text-xs text-base-content/40 font-medium">{u.registrationDateF}</span>
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-base-200 text-base-content/40'}`}>
                      {u.isActiveF}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg flex items-center justify-center text-base-content/30 hover:text-base-content hover:bg-base-200 transition-colors [&>svg]:w-3.5 [&>svg]:h-3.5">
                        <PencilIcon />
                      </button>
                      <button onClick={() => setDeleteTarget(u)} className="w-7 h-7 rounded-lg flex items-center justify-center text-error/30 hover:text-error hover:bg-error/10 transition-colors [&>svg]:w-3.5 [&>svg]:h-3.5">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit User' : 'Add New User'} size="lg"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.userName.trim() || !form.password.trim()}>
              {saveMutation.isPending ? <><span className="loading loading-spinner loading-xs" />Saving…</> : 'Save User'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Username *</label>
            <input className="input input-bordered w-full text-sm" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} placeholder="username" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Password *</label>
            <input type="password" className="input input-bordered w-full text-sm" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">First Name</label>
            <input className="input input-bordered w-full text-sm" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Last Name</label>
            <input className="input input-bordered w-full text-sm" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Gender</label>
            <select className="select select-bordered w-full text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: Number(e.target.value) })}>
              <option value={1}>Woman</option>
              <option value={2}>Man</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Birth Date</label>
            <input type="date" className="input input-bordered w-full text-sm" value={form.birthDate ?? ''} onChange={(e) => setForm({ ...form, birthDate: e.target.value || null })} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Registration Date</label>
            <input type="date" className="input input-bordered w-full text-sm" value={form.registrationDate} onChange={(e) => setForm({ ...form, registrationDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Score</label>
            <input type="number" step="0.1" className="input input-bordered w-full text-sm" value={form.score} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Address</label>
            <input className="input input-bordered w-full text-sm" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value || null })} placeholder="Street, city, country..." />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2">Roles</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <label key={r.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border cursor-pointer text-sm font-semibold transition-all duration-150 select-none ${
                  form.roleIds.includes(r.id)
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-base-200 border-transparent text-base-content/50 hover:border-base-300 hover:text-base-content/70'
                }`}>
                  <input type="checkbox" className="hidden" checked={form.roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} />
                  {r.name}
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 w-full text-left transition-all duration-200 ${form.isActive ? 'border-emerald-300 bg-emerald-50' : 'border-base-200 bg-base-100 hover:border-base-300'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${form.isActive ? 'bg-emerald-500 shadow-md shadow-emerald-200' : 'bg-base-200'}`}>
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{form.isActive ? 'Active User' : 'Inactive User'}</div>
                <div className="text-xs text-base-content/40">{form.isActive ? 'User can log in' : 'User cannot log in'}</div>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 ${form.isActive ? 'bg-emerald-500' : 'bg-base-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-error btn-sm" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-base-content/60">Delete user <strong className="text-base-content">@{deleteTarget?.userName}</strong>? This cannot be undone.</p>
      </Modal>

      <Toast message={toast} type={toastType} />
    </div>
  );
};
