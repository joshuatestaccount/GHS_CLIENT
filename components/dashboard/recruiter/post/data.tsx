import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { getJobStatus } from '../../../../util/job/job.query'
import styles from '../../../../styles/components/dashboard/post/data.module.scss'
import CardPost from './card'
import { jobSubscriptions } from '../../../../util/job/job.subscription'
import Image from 'next/image'
export default function DataStatus({ status, limit, order }: any) {

    const [ pages, setPages ] = useState(0)
    const { loading, data, error, subscribeToMore } = useQuery(getJobStatus, {
        variables: {
            status: status,
            take: limit,
            order: order,
            offset: pages * limit
        },
        fetchPolicy: "network-only",
        pollInterval: 1000
    })


    useEffect(() => {
        return subscribeToMore({
            document: jobSubscriptions,
            onError(error) {
                console.log(error)
            },
            updateQuery: (prev, { subscriptionData }) => {
                if (!subscriptionData.data) return prev
                const newPost = subscriptionData.data.createAJobPostSubscriptions
                return Object.assign({}, {
                    getJobByStatus: [ ...prev.getJobByStatus, newPost ]
                })
            }
        })
    }, [ subscribeToMore ])

    return (
        <div className={styles.container}>
            <div className={styles.gridContainer}>
                {loading ? "Loading" : data.getJobByStatus.map(({ jobPostID, title, description, status, users }: any) => (
                    users.map(({ profile }: any) => (
                        profile.map(({ firstname, lastname }: any) => (
                            <>
                                <CardPost key={jobPostID} id={jobPostID} title={title} description={description} status={status} author={`${firstname}, ${lastname}`} />
                            </>
                        ))
                    ))
                ))}
            </div>
            {loading ? "Loading" : data.getJobByStatus.length >= limit ? <div className={styles.pages}>
                <button disabled={!pages} onClick={() => setPages(() => pages - 1)}>
                    <Image src="/icon/arrow-left-line.svg" alt="" height={20} width={20} />
                </button>
                <span>{pages + 1}</span>
                <button disabled={loading ? true : data.getJobByStatus.length < limit} onClick={() => setPages(() => pages + 1)}>
                    <Image src="/icon/arrow-left-line.svg" alt="" height={20} width={20} />
                </button>
            </div> : null}
        </div>
    )
}
