import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Chip
} from '@mui/material';
import { getTopupHistory, Topup } from '../../api/topup.api';
import dayjs from 'dayjs';

const TopupHistory: React.FC = () => {
    const [data, setData] = useState<Topup[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchHistory = async () => {
        try {
            const res = await getTopupHistory({ page: page + 1, limit: rowsPerPage });
            if (res.success && res.data) {
                setData(res.data.data);
                setTotal(res.data.total);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Topup History</Typography>
            <Card>
                <CardContent>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S. No.</TableCell>
                                    <TableCell>Package</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(data) && data.length > 0 ? (
                                    data.map((row, index) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                            <TableCell>{row.package?.name}</TableCell>
                                            <TableCell>{row.amount}</TableCell>
                                            <TableCell>{dayjs(row.createdAt).format('MMM DD YYYY h:mmA')}</TableCell>
                                            <TableCell>
                                                <Chip label={row.status} color="success" size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No topup history found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default TopupHistory;
