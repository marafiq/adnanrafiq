import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import PakistanHomePictureUrl from '@site/static/img/pakistan-home-picture.jpg';
import LahorePictureUrl from '@site/static/img/lahore.jpg';
import BostonPictureUrl from '@site/static/img/boston.jpg';

export default function Home(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Adnan is a blogger, developer, freelancer, and introvert. ">
            <main>
                <p/>

                <div className="container">
                    <div className="row">
                        <div className="col">
                            <div className="card">
                                <div className="card__header">
                                    <h1 className="hero__title">👋🏽 Hi, I am Adnan Rafiq. </h1>
                                </div>
                                <div className="card__body">
                                    <p>
                                        A Senior Software Engineer with more
                                        than 15 years of
                                        experience.I love building application's using Microsoft Technology Stack.
                                    </p>

                                    <div className="row">
                                        <div className="col">

                                            <div className="card shadow--md">
                                                <div className="card__image">
                                                    <img
                                                        src={PakistanHomePictureUrl}
                                                        alt="Fields Outside My Home in Pakistan"
                                                        title="Fields Outside My Home in Pakistan"
                                                        style={{width: "100%", maxHeight: "300px"}}
                                                    />
                                                </div>
                                                <div className="card__body">
                                                    <h4>I am from Pakistan</h4>
                                                    <small>
                                                        I grew up in a small village in Pakistan. I passed my 10th-grade
                                                        using Laltein. A place where my parents, sisters, and extended
                                                        family live.
                                                    </small>
                                                </div>

                                            </div>

                                        </div>
                                        <div className="col">

                                            <div className="card shadow--md">
                                                <div className="card__image">
                                                    <img
                                                        src={LahorePictureUrl}
                                                        alt="Lahore Minar-e-Pakistan Picture"
                                                        title="Lahore Minar-e-Pakistan Picture"
                                                        style={{width: "100%", maxHeight: "300px"}}
                                                    />
                                                </div>
                                                <div className="card__body">
                                                    <h4>The Lahore.</h4>
                                                    <small>
                                                        The city of Lahore, where I studied and landed my first job as a
                                                        Software Developer. A
                                                        city with beautiful nightlife, food, and culture. A place where
                                                        friends live.
                                                    </small>
                                                </div>

                                            </div>

                                        </div>
                                        <div className="col">

                                            <div className="card shadow--md">
                                                <div className="card__image">
                                                    <img
                                                        src={BostonPictureUrl}
                                                        alt="Boston"
                                                        title="Boston"
                                                    />
                                                </div>
                                                <div className="card__body">
                                                    <h4>Boston</h4>
                                                    <small>
                                                        It's been more than seven years; I am working as a Senior
                                                        Software Engineer in Cengage Group. A place where I live with my
                                                        beautiful wife and kids.
                                                    </small>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
                <p/>


            </main>
        </Layout>
    );
}
