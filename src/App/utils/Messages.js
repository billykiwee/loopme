import React from 'react'


export default function Messages({statu, msg, loader}) {

    if (statu === 'error') {
        return (
            <div className="display display justify-c" style={{zIndex: 9}}>
                <div className=''>
                    <div className='border border-r-04 display justify-c gap p-lr-1 shadow margin-auto w-88' style={{background : '#feecef'}}>
                        <span className='display'>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18V18ZM8.707 7.293C8.5184 7.11084 8.2658 7.01005 8.0036 7.01233C7.7414 7.0146 7.49059 7.11977 7.30518 7.30518C7.11977 7.49059 7.0146 7.7414 7.01233 8.0036C7.01005 8.2658 7.11084 8.5184 7.293 8.707L8.586 10L7.293 11.293C7.19749 11.3852 7.12131 11.4956 7.0689 11.6176C7.01649 11.7396 6.9889 11.8708 6.98775 12.0036C6.9866 12.1364 7.0119 12.2681 7.06218 12.391C7.11246 12.5139 7.18671 12.6255 7.2806 12.7194C7.3745 12.8133 7.48615 12.8875 7.60905 12.9378C7.73194 12.9881 7.86362 13.0134 7.9964 13.0123C8.12918 13.0111 8.2604 12.9835 8.3824 12.9311C8.50441 12.8787 8.61475 12.8025 8.707 12.707L10 11.414L11.293 12.707C11.4816 12.8892 11.7342 12.99 11.9964 12.9877C12.2586 12.9854 12.5094 12.8802 12.6948 12.6948C12.8802 12.5094 12.9854 12.2586 12.9877 11.9964C12.99 11.7342 12.8892 11.4816 12.707 11.293L11.414 10L12.707 8.707C12.8892 8.5184 12.99 8.2658 12.9877 8.0036C12.9854 7.7414 12.8802 7.49059 12.6948 7.30518C12.5094 7.11977 12.2586 7.0146 11.9964 7.01233C11.7342 7.01005 11.4816 7.11084 11.293 7.293L10 8.586L8.707 7.293Z" fill="#ee5253"/>
                            </svg>
                        </span>
                        <div>
                            <span className='f-s-14 f-w-300'>{msg}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (statu === 'success') {
        return (
        <div className="sucess-message display justify-c">
            <div className='border-green-light'>
                <div>
                    <svg width="18" height="18" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M10 18.5C12.1217 18.5 14.1566 17.6571 15.6569 16.1569C17.1571 14.6566 18 12.6217 18 10.5C18 8.37827 17.1571 6.34344 15.6569 4.84315C14.1566 3.34285 12.1217 2.5 10 2.5C7.87827 2.5 5.84344 3.34285 4.34315 4.84315C2.84285 6.34344 2 8.37827 2 10.5C2 12.6217 2.84285 14.6566 4.34315 16.1569C5.84344 17.6571 7.87827 18.5 10 18.5V18.5ZM13.707 9.207C13.8892 9.0184 13.99 8.7658 13.9877 8.5036C13.9854 8.2414 13.8802 7.99059 13.6948 7.80518C13.5094 7.61977 13.2586 7.5146 12.9964 7.51233C12.7342 7.51005 12.4816 7.61084 12.293 7.793L9 11.086L7.707 9.793C7.5184 9.61084 7.2658 9.51005 7.0036 9.51233C6.7414 9.5146 6.49059 9.61977 6.30518 9.80518C6.11977 9.99059 6.0146 10.2414 6.01233 10.5036C6.01005 10.7658 6.11084 11.0184 6.293 11.207L8.293 13.207C8.48053 13.3945 8.73484 13.4998 9 13.4998C9.26516 13.4998 9.51947 13.3945 9.707 13.207L13.707 9.207V9.207Z" fill="#1dd1a1"/>
                    </svg>
                </div>
                <div>
                    <span className='f-s-14'>{msg}</span>
                </div>
            </div>
        </div>
        )
    }

    if (loader === true) {
        return (
            <div className='loader-spinner display justify-c'>
                <div className='loader-spinner'>
                    <img alt='loader' src='/images/loader.svg'></img>
                </div>
            </div>
        )
    }
}
