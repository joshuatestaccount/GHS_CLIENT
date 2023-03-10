import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import styles from '../../../../styles/components/dashboard/endorsement/endorse.module.scss'
import { endorseTo } from '../../../../util/endorse/endorse.query'
import { CreateEndorse } from '../../../../util/endorse/endorse.mutation'
import Message from '../../../message/message'
import Image from 'next/image'
import Cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'
import { endorsementById } from '../../../../util/endorsement/endorsement.query'
export default function Endorse({ endorsementID, close }: any) {

    const [ pages, setPages ] = useState(0)
    const [ message, setMessage ] = useState(false)
    const [ userid, setUserId ] = useState("")
    const [ company, setCompany ] = useState([]) as any
    const [ isRender, setRender ] = useState(false)

    useEffect(() => {
        const cookies = Cookies.get("ghs_access_token")
        if (cookies) {
            const { userID }: any = jwtDecode(cookies)
            setUserId(userID)
        }
    }, [])

    const limit = 10


    const { loading, data } = useQuery(endorseTo, {
        variables: {
            limit: limit,
            offset: pages * limit
        },
        onError: error => {
            console.log(error.message)
        }
    })

    const { loading: endorLoad, data: endoData } = useQuery(endorsementById, {
        variables: {
            endorsementId: endorsementID
        },
        onCompleted: () => {
            setRender(true)
        }
    })


    const [ createEndorse, { data: dataEndorse } ] = useMutation(CreateEndorse)

    const sendEndorsement = (e: any) => {
        e.preventDefault()
        createEndorse({
            variables: {
                endorsementId: endorsementID,
                companyId: e.target.value,
                userId: userid
            },
            onCompleted: data => {
                setMessage(true)
            },
            onError: error => {
                console.log(error.message)
            }
        })
    }

    useEffect(() => {
        setTimeout(() => {
            setMessage(false)
        }, 2000)
    }, [ message ])

    useEffect(() => {
        if (isRender) {
            endoData.getEndorsementById.map(({ endorse }: any) => {
                endorse.map(({ company }: any) => {
                    company.map(({ companyName }: any) => {
                        setCompany([ companyName ])
                    })
                })
            })
        }

        setRender(false)
    }, [ endoData, isRender ])


    if (endorLoad) return null

    console.log(company)

    return (
        <div className={styles.container}>
            {dataEndorse && message ? <div className={styles.message}> <Message label={'Successfully Endorse'} status={'success'} message={''} /> </div> : null}
            <div className={styles.header}>
                <h2>Endorse</h2>
                <button onClick={() => close(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d02222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div className={styles.body}>
                {loading ? "Loading" : data.getEmployerCompany.length === 0 ? "None" : data.getEmployerCompany.map(({ companyID, companyName }: any) => (
                    <div className={styles.company} key={companyID}>
                        <h2>{companyName}</h2>
                        {company.map((data: any) => (data === companyName ?
                            <button disabled={data === companyName} onClick={sendEndorsement} value={companyID}>Endorsed</button>
                            : <button onClick={sendEndorsement} value={companyID}>Endorse</button>
                        ))}
                    </div>
                ))
                }
            </div>
            <div className={styles.footer}>
                <button disabled={!pages} onClick={() => setPages(pages - 1)}>
                    <Image src="/icon/arrow-left-line.svg" alt="" height={20} width={20} />
                </button>
                <span>{pages + 1}</span>
                <button disabled={loading ? true : data.getEmployerCompany.length < 10 || data.getEmployerCompany === 0} onClick={() => setPages(pages + 1)}>
                    <Image src="/icon/arrow-right-line.svg" alt="" height={20} width={20} />
                </button>
            </div>
        </div>

    )
}
