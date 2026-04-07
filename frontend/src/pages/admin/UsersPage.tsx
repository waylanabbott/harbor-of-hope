import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  fetchUsers,
  createUser,
  changeUserRole,
  deleteUser,
} from '../../lib/usersApi';
import type { UserItem } from '../../lib/usersApi';

export default function UsersPage() {
  useEffect(() => {
    document.title = 'Users | Harbor of Hope';
  }, []);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Donor');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Role change dialog
  const [roleTarget, setRoleTarget] = useState<UserItem | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async () => {
    try {
      setCreateLoading(true);
      setCreateError(null);
      await createUser(newEmail, newPassword, newRole);
      setCreateOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('Donor');
      await loadUsers();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleTarget) return;
    const isCurrentlyAdmin = roleTarget.roles.includes('Admin');
    const newRoleValue = isCurrentlyAdmin ? 'Donor' : 'Admin';
    try {
      setRoleLoading(true);
      await changeUserRole(roleTarget.id, newRoleValue);
      setRoleTarget(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change role.');
      setRoleTarget(null);
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Users
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Create User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>MFA</TableCell>
                <TableCell>Linked Supporter</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.roles.map((role) => (
                      <Chip
                        key={role}
                        label={role}
                        size="small"
                        color={role === 'Admin' ? 'error' : 'primary'}
                        variant="outlined"
                        sx={{ mr: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    {user.twoFactorEnabled ? (
                      <Chip label="Enabled" size="small" color="success" variant="outlined" />
                    ) : (
                      <Chip label="Off" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    {user.supporterId ? `#${user.supporterId}` : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => setRoleTarget(user)}
                      title={user.roles.includes('Admin') ? 'Revoke Admin' : 'Grant Admin'}
                    >
                      <SwapHorizIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteTarget(user)}
                      title="Delete user"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create User Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => !createLoading && setCreateOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Create User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {createError && (
            <Alert severity="error" onClose={() => setCreateError(null)}>
              {createError}
            </Alert>
          )}
          <TextField
            label="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            helperText="Minimum 14 characters"
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              label="Role"
              onChange={(e) => setNewRole(e.target.value)}
            >
              <MenuItem value="Admin">Admin + Donor</MenuItem>
              <MenuItem value="Donor">Donor only</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={createLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={createLoading || !newEmail || !newPassword}
            startIcon={createLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.email}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* Role Change Confirm Dialog */}
      <Dialog
        open={!!roleTarget}
        onClose={() => !roleLoading && setRoleTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {roleTarget?.roles.includes('Admin') ? 'Revoke Admin' : 'Grant Admin'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {roleTarget?.roles.includes('Admin')
              ? <>Remove admin privileges from <strong>{roleTarget?.email}</strong>? They will keep their Donor role.</>
              : <>Grant admin privileges to <strong>{roleTarget?.email}</strong>? They will keep their Donor role.</>
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRoleTarget(null)} disabled={roleLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRoleChange}
            variant="contained"
            color={roleTarget?.roles.includes('Admin') ? 'error' : 'primary'}
            disabled={roleLoading}
            startIcon={roleLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {roleTarget?.roles.includes('Admin') ? 'Revoke Admin' : 'Grant Admin'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
