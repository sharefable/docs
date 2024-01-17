import * as React from 'react';
import Progress from './nprogress';

const Loader = () => {
    React.useEffect(() => {
        Progress.done();
        console.log('end')
        return () => Progress.start();
    }, []);

    return <></>
}

export default Loader;