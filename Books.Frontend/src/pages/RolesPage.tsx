import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, createRole, updateRole, deleteRole } from '../api/rolesApi';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { PlusIcon, PencilIcon, TrashIcon, ShieldIcon } from '../components/Icons';
import type { RoleResponse } from '../types';

const emptyForm = { name: '' };

const roleColors = [
  { pill: 'bg-blue-100 text-blue-700 border-blue-200',         icon: 'bg-blue-500'    },
  { pill: 'bg-violet-100 text-violet-700 border-violet-200',   icon: 'bg-violet-500'  },
  { pill: 'bg-rose-100 text-rose-700 border-rose-200',         icon: 'bg-rose-500'    },
  { pill: 'bg-amber-100 text-amber-700 border-amber-200',      icon: 'bg-amber-500'   },
  { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200',icon: 'bg-emerald-500' },
];
const getColors = (id: number) => roleColors[id % roleColors.length];

const RoleSkeleton = () => (
  <div className="bg-base-100 border border-base-200 rounded-2xl p-5 flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl shimmer shrink-0" />
    <div className="h-6 w-20 shimmer rounded-full" />
  </div>
);

export const RolesPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm]                 = useState(emptyForm);
  const [editId, setEditId]             = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleResponse | null>(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [toast, setToast]               = useState('');
  const [toastType, setToastType]       = useState<'success' | 'error'>('success');

  const { data: roles = [], isLoading } = useQuery({ queryKey: ['roles'], queryFn: getRoles });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editId ? updateRole({ ...data, id: editId }) : createRole(data),
    onSuccess: (res) => {
      if (res.data.isSuccessful) {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        showToast(res.data.message);
        setModalOpen(false);
      } else {
        showToast(res.data.message, 'error');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showToast(res.data.message);
      setDeleteTarget(null);
    },
  });

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };
  const openEdit = (r: RoleResponse) => { setForm({ name: r.name }); setEditId(r.id); setModalOpen(true); };

  return (
    <div className="animate-fade-in">
      <PageHeader
        section="Access Control"
        title="Roles"
        subtitle={`${roles.length} role${roles.length !== 1 ? 's' : ''} defined`}
        action={
          <button onClick={openAdd} className="btn btn-primary btn-sm gap-1.5">
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5"><PlusIcon /></span> Add Role
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <RoleSkeleton key={i} />)}
        </div>
      ) : roles.length === 0 ? (
        <EmptyState icon={<ShieldIcon />} title="No roles defined" subtitle="Add your first role to get started" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {roles.map((r, i) => {
            const c = getColors(r.id);
            return (
              <div
                key={r.id}
                className="group bg-base-100 border border-base-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center text-white [&>svg]:w-5 [&>svg]:h-5`}>
                    <ShieldIcon />
                  </div>
                  <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${c.pill}`}>
                    {r.name}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => openEdit(r)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base-content/30 hover:text-base-content hover:bg-base-200 transition-colors [&>svg]:w-3.5 [&>svg]:h-3.5"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-error/30 hover:text-error hover:bg-error/10 transition-colors [&>svg]:w-3.5 [&>svg]:h-3.5"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Role' : 'Add New Role'} size="sm"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name.trim()}>
              {saveMutation.isPending ? <><span className="loading loading-spinner loading-xs" />Saving…</> : 'Save Role'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-base-content/40 mb-1.5">Role Name *</label>
          <input className="input input-bordered w-full text-sm" value={form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="e.g. Admin, Editor" autoFocus />
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Role" size="sm"
        footer={
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-error btn-sm" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-base-content/60">Delete role <strong className="text-base-content">{deleteTarget?.name}</strong>? This cannot be undone.</p>
      </Modal>

      <Toast message={toast} type={toastType} />
    </div>
  );
};
