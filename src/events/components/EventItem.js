import React, { useState, useContext} from 'react';
import { Link } from 'react-router-dom';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import Comments from './Comments';
import Likes from '../../shared/components/UIElements/Likes';

import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';

import './EventItem.css';

const PlaceItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [image, setFullImage] = useState(false);

  const openMapHandler = () => setShowMap(true);

  const closeMapHandler = () => setShowMap(false);

  const showDeleteWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/events/${props.id}`,
        'DELETE',
        null,
        {
          Authorization: 'Bearer ' + auth.token
        }
      );
      props.onDelete(props.id);
    } catch (err) {}
  };

  const imageZoom = (event)=>{
    console.log('Click!!',event.target);
    setFullImage(prev=>!prev)
  }

  
  // logic for checking for an active link in a post:
  let description;
  let url= "https:";
  let link;
  if(props.description.includes(url) && props.description.indexOf(' ') <= 0){
    return description = <a href={props.description}>click here</a>;
    }
  else if(props.description.includes(url) && props.description.indexOf(' ') >= 0){
      // we are creating new array now, words with url are assign to link and not returned,
      // other words are simply returned to be part of the new array
      description = props.description.split(' ').map(word=>{
        if(word.includes(url)){
          word = <a href={word} target="_blank" rel="noopener noreferrer">click here</a>;
          link= word;
        }else{
          return word
        }}).join(' ');
  }else{
        description = props.description;
        }
      
  
  let displayContent;
  // if !props.image we are dealing with new post:
  if(!props.image){
    displayContent = 
      <div className="event-item__info event-item__info--post">
        <p className="event-item__description event-item__description--post">{description} {link}</p>
        <div className="event-item__info">
          <Link to="/users">
            <span className= "event-item__avatar"><img src={props.creatorImage} alt="profile"/></span>
          </Link>
          <span className='event-item__name'>{props.name}</span>
          <span className='event-item__date'>{props.date}</span>
        </div>
      </div>
  }else{
    // here we have props.image we are dealing with new photo:
    displayContent =  
      <div>
        <div className={image?"event-item__image--background":"event-item__image"}>
          <img className={image? 'event-item__full-image' : ''}
          src={props.image}
          lt={props.title}
          onClick={imageZoom}/>
        </div> 
        <div className="event-item__info">
          <Link to="/users">
            <span className= "event-item__avatar"><img src={props.creatorImage} alt="profile"/></span>
          </Link>   
          <span className='event-item__name'>{props.name}</span>
          <span className='event-item__description'> {props.description}</span>
          <span className='event-item__date'>{props.date}</span>
        </div>
      </div>
      }


  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        className="event-item__modal"
        contentClass="event-item__modal-content"
        footerClass="event-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>CLOSE</Button>}
      >
        <div className="map-container">
          <Map center={props.coordinates} zoom={16} />
        </div>
      </Modal>
      <Modal
        show={showConfirmModal}
        onCancel={cancelDeleteHandler}
        header="Are you sure you want to continiue?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>
              CANCEL
            </Button>
            
            <Button inverse onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }>
        <p>This action can not be reverted.</p>
      </Modal>
      <li className="event-item">
        <Card className="event-item__content">
          {isLoading && <LoadingSpinner asOverlay />}
          {displayContent}
          <Likes placeId={props.id} likes={props.likes}/>
          <div className="event-item__actions">
            <Button inverse onClick={openMapHandler}>
              WHERE
            </Button>
            {auth.userId === props.creatorId && (
              <Button to={`/events/${props.id}`}>UPDATE</Button>
            )}

            {auth.userId === props.creatorId && (
              <Button onClick={showDeleteWarningHandler}>
                DELETE
              </Button>
            )}
          </div>
          <Comments id={props.id} comments={props.comments}/>
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;

