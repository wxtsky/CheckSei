import './App.css';
import {Button, Input, Space, Table, Card, Typography, Spin, message} from 'antd';
import {useState} from 'react';
import axios from 'axios';
import {TwitterOutlined} from '@ant-design/icons';

const {TextArea} = Input;
const {Title} = Typography;

function App() {
    const [data, setData] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const refreshRow = async (address, index) => {
        const url = "https://pacific-1.albatross.sei-internal.com/eligibility?originAddress=" + address.toLowerCase();
        try {
            const res = await axios.get(url);
            const updatedData = [...data];
            updatedData[index] = {
                address: address,
                isEligible: res.data.status,
                chainId: res.data.data.chainId
            };
            setData(updatedData);
        } catch (e) {
            const updatedData = [...data];
            updatedData[index] = {
                address: address,
                isEligible: 'error',
                chainId: '-'
            };
            setData(updatedData);
        }
    };

    const check = async () => {
        setLoading(true);
        setData([]);
        const arr = input.split('\n');
        for (let i = 0; i < arr.length; i++) {
            const address = arr[i];
            if (address === '') {
                continue;
            }
            const url = "https://pacific-1.albatross.sei-internal.com/eligibility?originAddress=" + address.toLowerCase();
            let success = false;
            let attempts = 0;
            while (attempts < 3 && !success) {
                try {
                    const res = await axios.get(url);
                    setData(prevData => [...prevData, {
                        address: address,
                        isEligible: res.data.status,
                        chainId: res.data.data.chainId
                    }]);
                    success = true;
                } catch (e) {
                    attempts++;
                }
            }
            if (!success) {
                setData(prevData => [...prevData, {
                    address: address,
                    isEligible: 'error',
                    chainId: '-'
                }]);
            }
        }
        message.success('查询完成');
        setLoading(false);
    }

    const columns = [
        {
            title: 'EVM地址',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: '是否符合资格',
            dataIndex: 'isEligible',
            key: 'isEligible',
            render: (text) => {
                if (text === "success") {
                    return <span style={{color: 'green'}}>是</span>
                } else if (text === "fail") {
                    return <span style={{color: 'red'}}>否</span>
                } else if (text === "error") {
                    return <span style={{color: 'red'}}>获取失败</span>
                }
            }
        },
        {
            title: '链ID',
            dataIndex: 'chainId',
            key: 'chainId',
        },
        {
            title: '刷新',
            key: 'refresh',
            render: (text, record, index) => (
                <Button type="primary" onClick={() => refreshRow(record.address, index)}>
                    刷新
                </Button>
            ),
        }
    ];

    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Title level={2}>Sei 空投资格EVM地址查询</Title>
            <a href="https://twitter.com/jingluo0"
               target="_blank"
               rel="noreferrer"
               style={{
                   display: 'flex',
                   alignItems: 'center',
                   fontSize: '18px',
                   color: '#1DA1F2',
                   marginBottom: '20px',
                   textDecoration: 'none',
                   transition: 'color 0.3s',
               }}
            >
                <TwitterOutlined style={{fontSize: '24px', marginRight: '8px'}}/>
                有需要帮忙找弟弟，给你安排到位。
            </a>
            <Card style={{width: '80%', marginBottom: '20px'}}>
                {loading && <div style={{textAlign: 'center'}}><Spin tip="查询中..."/></div>}
                <TextArea
                    rows={4}
                    placeholder="输入你的EVM地址一行一个"
                    onChange={(e) => {
                        setInput(e.target.value);
                    }}
                    value={input}
                />
                <Space style={{margin: '10px 0', justifyContent: 'flex-end'}}>
                    <Button type="primary" onClick={check} disabled={loading}>
                        查询
                    </Button>
                    <Button type="default" onClick={() => {
                        setData([]);
                    }} disabled={loading}>
                        清空
                    </Button>
                </Space>
            </Card>
            <Card style={{width: '80%'}}>
                <Table dataSource={data} columns={columns} size="small" pagination={false}/>
            </Card>
        </div>
    );
}

export default App;
