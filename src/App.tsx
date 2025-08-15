import './App.scss';
import { useEffect, useState } from 'react';
import { Outlet,useNavigate } from 'react-router-dom';
import {Card,Button} from 'antd';

function App() {
  const [isStartPages, setIsStartPages] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 进入页面时一定进入起始页
    setIsStartPages(true);
    return () => {
      setIsStartPages(true);
    };
  }, [])
  
  function handleEnterApp() {
    setIsStartPages(false);
    navigate('/home');
  }

  return (
    <>
      <div className='app'>
        {isStartPages ? (
          <>
            <Card className='card'>
              <div className='startPages'>
                <h1 className='title'>wifi calling</h1>
                <p className='desc'>在线电话</p>
                <Button type='primary' onClick={() => {
                  handleEnterApp();
                }}>进入应用</Button>
              </div>
            </Card>
          </>
        ): (
          <>
            <Outlet />
          </>
        )}
      </div>
    </>
  );
}

export default App;
