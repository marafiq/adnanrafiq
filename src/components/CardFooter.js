import AvatarUrl from "@site/static/img/profile-avatar.jpg";
import React from "react";

export default function CodeBlockFooter() {
    return <div className="card__footer" style={{color: "rgb(245, 246, 247)"}}>
        <div className="avatar">
            <a
                className="avatar__photo-link avatar__photo avatar__photo--lg"
                href="https://adnanrafiq.com"
            >
                <img
                    alt="Adnan Picture"
                    src={AvatarUrl}
                />
            </a>
            <div className="avatar__intro">
                <div className="avatar__name">Adnan Rafiq</div>
                <small className="avatar__subtitle">
                    A Senior Software Engineer with more than 15 years of experience.
                </small>
                <small><a href={"https://adnanrafiq.com"}>https://adnanrafiq.com</a> </small>
            </div>
        </div>

    </div>;
}
