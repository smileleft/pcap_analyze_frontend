import React, { useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Typography, Paper } from '@mui/material';

const App = () => {
    const [filename, setFilename] = useState("");
    const [packets, setPackets] = useState([]);
    const [streamContent, setStreamContent] = useState("");
    const [loading, setLoading] = useState(false);

    // 1. 파일 업로드
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        const res = await axios.post("http://localhost:8888/upload", formData);
        setFilename(res.data.filename);
        loadPackets(res.data.filename);
    };

    // 2. 패킷 목록 로드 (Pagination)
    const loadPackets = async (fname) => {
        setLoading(true);
        const res = await axios.get(`http://localhost:8888/packets?filename=${fname}`);
        setPackets(res.data.packets);
        setLoading(false);
    };

    // 3. TCP 스트림 재조합 요청
    const handleRowClick = async (params) => {
        const streamId = params.row.stream_id;
        const res = await axios.get(`http://localhost:8888/stream/${streamId}?filename=${filename}`);
        setStreamContent(res.data.content);
    };

    const columns = [
        { field: 'id', headerName: 'No', width: 80 },
        { field: 'src', headerName: 'Source IP', width: 150 },
        { field: 'dst', headerName: 'Dest IP', width: 150 },
        { field: 'sport', headerName: 'S-Port', width: 90 },
        { field: 'dport', headerName: 'D-Port', width: 90 },
        { field: 'stream_id', headerName: 'Stream ID', width: 100 },
        { field: 'len', headerName: 'Length', width: 90 },
    ];

    return (
        <Box sx={{ p: 3, height: '90vh', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4">Web Pcap Analyzer</Typography>
            <input type="file" onChange={handleFileChange} />

            <Box sx={{ flex: 1, minHeight: 400 }}>
                <DataGrid
                    rows={packets}
                    columns={columns}
                    loading={loading}
                    onRowClick={handleRowClick}
                    sx={{ backgroundColor: 'white' }}
                />
            </Box>

            <Paper sx={{ flex: 1, p: 2, backgroundColor: '#1e1e1e', color: '#4af626', overflow: 'auto' }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>TCP Stream Reassembly</Typography>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {streamContent || "패킷을 클릭하여 세션 대화 내용을 확인하세요."}
                </pre>
            </Paper>
        </Box>
    );
};

export default App;
