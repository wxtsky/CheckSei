import './App.css';
import {Button, Input, Space, Table, Card, Typography, message, Tag} from 'antd';
import {useState} from 'react';
import axios from 'axios';
import {TwitterOutlined} from '@ant-design/icons';

const {TextArea} = Input;
const {Title, Text} = Typography;

function App() {
    const [data, setData] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
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
                    const isBind = res.data.data['seiAddress'] ? res.data.data['seiAddress'] : '否';
                    let crossAmount = 0;
                    if (isBind) {
                        const url = "https://pacific-1.albatross.sei-internal.com/connected?seiAddress=" + isBind.toLowerCase();
                        const res = await axios.get(url);
                        const data = res.data;
                        if (data.status !== "success") {
                            crossAmount = '获取失败';
                        } else {
                            if (data.data['lootbox']) {
                                const opened = data.data['lootbox']['opened'];
                                const amount = data.data['lootbox']['amount'];
                                if (opened) {
                                    crossAmount = '已开盒' + '(' + Number(amount / 10 ** 6).toFixed(0) + ')';
                                } else {
                                    crossAmount = '未开';
                                }
                            } else {
                                if (data.data['tx']) {
                                    const {usdValue} = data.data['tx'];
                                    crossAmount = usdValue;
                                }
                            }
                        }
                    }
                    setData(prevData => [...prevData, {
                        address: address,
                        isEligible: res.data.status,
                        chainId: res.data.data.chainId,
                        isBind: res.data.status === "fail" ? null : res.data.data['seiAddress'] ? res.data.data['seiAddress'] : '否',
                        crossAmount: res.data.status === "fail" ? null : crossAmount
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
            render: (text) => <Text copyable>{text}</Text>
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
            title: '链',
            dataIndex: 'chainId',
            key: 'chainId',
        },
        {
            title: '是否已绑定sei地址',
            dataIndex: 'isBind',
            key: 'isBind',
            render: (text, record) => {
                if (record.isEligible === 'error') {
                    return <span style={{color: 'red'}}>获取失败</span>
                } else {
                    if (text === "否") {
                        return <span style={{color: 'red'}}>否</span>
                    } else if (text) {
                        return <Text copyable style={{color: 'green'}}>{text}</Text>
                    } else if (text === null) {
                        return null;
                    }
                }
            }
        },
        {
            title: '跨链金额',
            dataIndex: 'crossAmount',
            key: 'crossAmount',
            render: (text, record) => {
                if (record.isEligible === 'error') {
                    return <span style={{color: 'red'}}>获取失败</span>
                } else {
                    if (record.isBind === "否") {
                        return <span style={{color: 'red'}}>无</span>
                    } else {
                        return <span style={{color: 'green'}}>{text}</span>
                    }
                }
            }
        },
        {
            title: '报错刷新',
            key: 'refresh',
            render: (text, record) => (
                record.isEligible === 'error' ? (
                    <Tag color="red-inverse">获取正常</Tag>
                ) : <Tag color="green-inverse">获取正常</Tag>
            ),
        }
    ];

    return (
        <div style={{padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
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
                有没有大佬dddd。
            </a>
            <Card style={{width: '80%', marginBottom: '10px'}}>
                <TextArea
                    placeholder="输入你的EVM地址一行一个"
                    onChange={(e) => {
                        setInput(e.target.value);
                    }}
                    value={input}
                    style={{
                        height: 200,
                    }}
                />
                <Space style={{margin: '10px 0', justifyContent: 'flex-end'}}>
                    <Button type="primary" onClick={check} loading={loading}>
                        {
                            loading ? '查询中...' : '查询'
                        }
                    </Button>
                    <Button type="default" onClick={() => {
                        setData([]);
                    }} disabled={loading}>
                        清空
                    </Button>
                </Space>
            </Card>
            <Card style={{width: '80%'}}>
                <Table bordered dataSource={data} columns={columns} size="small" pagination={false}/>
            </Card>
        </div>
    );
}

export default App;
