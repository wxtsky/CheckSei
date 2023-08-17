import './App.css';
import {Button, Input, Space, Table, Card, Typography} from 'antd';
import {useState} from 'react';
import axios from 'axios';

const {TextArea} = Input;
const {Title} = Typography;

function App() {
    const [data, setdata] = useState([]);
    const [input, setInput] = useState('');
    const check = async () => {
        setdata([])
        const arr = input.split('\n');
        for (let i = 0; i < arr.length; i++) {
            const address = arr[i];
            if (address === '') {
                continue;
            }
            try {
                const url = "https://pacific-1.albatross.sei-internal.com/eligibility?originAddress=" + address.toLowerCase();
                const res = await axios.get(url);
                setdata(prevData => [...prevData, {
                    address: address,
                    isEligible: res.data.status
                }]);
            } catch (e) {
                setdata(prevData => [...prevData, {
                    address: address,
                    isEligible: 'error'
                }]);
            }
        }
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
        }
    ]
    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Title level={2}>Sei 空投资格EVM地址查询</Title>
            <Card style={{width: '80%', marginBottom: '20px'}}>
                <TextArea
                    rows={4}
                    placeholder="输入你的EVM地址一行一个"
                    onChange={(e) => {
                        setInput(e.target.value);
                    }}
                    value={input}
                />
                <Space style={{margin: '10px 0', justifyContent: 'flex-end'}}>
                    <Button type="primary" onClick={check}>
                        查询
                    </Button>
                    <Button type="default" onClick={() => {
                        setdata([]);
                    }}>
                        清空
                    </Button>
                </Space>
            </Card>
            <Card style={{width: '80%'}}>
                <Table dataSource={data} columns={columns} size="small" pagination={false}/>
            </Card>
        </div>
    )
}

export default App
