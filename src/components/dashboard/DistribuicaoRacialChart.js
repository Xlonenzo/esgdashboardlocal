import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import axios from 'axios';
import { API_URL } from '../../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DistribuicaoRacialChart = () => {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/kpi-racial-distribution`);
                
                if (response.data && response.data.dados) {
                    setData(response.data.dados);
                    setTotal(response.data.total);
                } else {
                    setError('Dados recebidos em formato inválido');
                }
            } catch (err) {
                console.error('Erro ao carregar dados:', err);
                setError(`Erro ao carregar dados: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Carregando dados...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-600">
                    <p className="font-bold">Erro ao carregar o gráfico</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Nenhum dado disponível</div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 shadow-lg rounded-lg border">
                    <p className="font-bold">{data.raca}</p>
                    <p>Quantidade: {data.quantidade}</p>
                    <p>Percentual: {data.percentual.toFixed(2)}%</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        dataKey="quantidade"
                        nameKey="raca"
                        label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            value,
                            index
                        }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = 25 + innerRadius + (outerRadius - innerRadius);
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                                <text
                                    x={x}
                                    y={y}
                                    fill="#666"
                                    textAnchor={x > cx ? 'start' : 'end'}
                                    dominantBaseline="central"
                                >
                                    {`${data[index].raca} (${value})`}
                                </text>
                            );
                        }}
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-3xl font-bold">{total}</div>
                <div className="text-sm text-gray-500">Total</div>
            </div>
        </div>
    );
};

export default DistribuicaoRacialChart; 