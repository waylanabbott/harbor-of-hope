import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  IconButton,
  LinearProgress,
  Typography,
  Box,
  Collapse,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (column: string) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  loading?: boolean;
  getRowId: (row: T) => number | string;
}

export default function DataTable<T>({
  columns,
  rows,
  totalCount,
  page,
  pageSize,
  sortBy,
  sortDir,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  renderExpandedRow,
  onEdit,
  onDelete,
  loading = false,
  getRowId,
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<number | string>>(
    new Set()
  );

  const toggleExpand = (id: number | string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasExpand = !!renderExpandedRow;
  const hasActions = !!(onEdit || onDelete);
  const totalColumns =
    columns.length + (hasExpand ? 1 : 0) + (hasActions ? 1 : 0);

  return (
    <Paper variant="outlined" sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        {loading && <LinearProgress />}
        <Table aria-label="Data table">
          <TableHead>
            <TableRow>
              {hasExpand && <TableCell scope="col" sx={{ width: 48 }} />}
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  scope="col"
                  align={col.align ?? 'left'}
                  sx={{ minWidth: col.minWidth }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortDir : 'asc'}
                      onClick={() => onSortChange(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell scope="col" align="right" sx={{ minWidth: 100 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={totalColumns}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    No records found
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {rows.map((row) => {
              const rowId = getRowId(row);
              const isExpanded = expandedRows.has(rowId);

              return (
                <React.Fragment key={rowId}>
                  <TableRow hover>
                    {hasExpand && (
                      <TableCell sx={{ width: 48, p: 0 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleExpand(rowId)}
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        >
                          {isExpanded ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.id} align={col.align ?? 'left'}>
                        {col.render
                          ? col.render(row)
                          : String(
                              (row as Record<string, unknown>)[col.id] ?? ''
                            )}
                      </TableCell>
                    ))}
                    {hasActions && (
                      <TableCell align="right">
                        {onEdit && (
                          <IconButton
                            size="small"
                            onClick={() => onEdit(row)}
                            color="primary"
                            aria-label="Edit record"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(row)}
                            color="error"
                            aria-label="Delete record"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>

                  {hasExpand && (
                    <TableRow>
                      <TableCell
                        colSpan={totalColumns}
                        sx={{ py: 0, borderBottom: isExpanded ? undefined : 0 }}
                      >
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 1 }}>
                            {renderExpandedRow!(row)}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Paper>
  );
}
