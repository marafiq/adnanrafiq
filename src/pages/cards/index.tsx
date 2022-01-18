import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeBlock from "@theme/CodeBlock";
import {Cards} from './_cards';


export default function Home(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();
    // @ts-ignore
    return <Layout
        title={`${siteConfig.title} - cards`}
        description="Adnan is a blogger, developer, freelancer, and caretaker. A code cards page. ">

        <main>
            <p/>

            <div className="container">
                <h1 className="hero__title">👋🏽 Code Cards</h1>
                <div className="row">
                    {Cards.map(({description, fileName, language, title}, index) =>
                        <div className="col" key={index}>
                            <CodeBlock className={language} title={title} index={index} key={index}
                                // @ts-ignore
                                       description={description}
                                // @ts-ignore
                                       showFooter={true}>

                                {

                                    require(`!!raw-loader!./${fileName}`).default
                                }


                            </CodeBlock>
                        </div>
                    )}
                </div>

            </div>
            <p/>


        </main>
    </Layout>;
}
