import * as React from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const Loader = () => {
    React.useEffect(() => {
        NProgress.configure({ showSpinner: false })

        NProgress.start();
        return () => {
            NProgress.done();
        }
    }, []);

    return <></>
}

export default Loader;