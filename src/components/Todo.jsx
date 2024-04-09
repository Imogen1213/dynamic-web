// import { useEffect, useRef, useState } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Webcam from "react-webcam";
import { addPhoto, GetPhotoSrc } from "../db.jsx";

function createMap(mapURL) {



}
function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}



function Todo(props) {
  const [isEditing, setEditing] = useState(false);
  const [newName, setNewName] = useState(props.name); // Initialize with the current task's name
  const [completionDate, setCompletionDate] = useState(props.completionDate || "");
  const [newdueDate, setNewDueDate] = useState(props.dueDate); // Initialize with the current task's due date
  const [newDesc, setNewDesc] = useState(props.description);



  const editFieldRef = useRef(null);
  const editButtonRef = useRef(null);

  const wasEditing = usePrevious(isEditing);

  function handleChange(event) {
    setNewName(event.target.value);
  }
  function handleDateChange(event) {
    setCompletionDate(event.target.value);
  }
  function handleDueDateChange(event) {
    setNewDueDate(event.target.value);
  }
  function handleDescChange(event) {
    setNewDesc(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Check if newName is not empty
    if (newName.trim() !== "") {
      // Pass the due date to the editTask function
      props.editTask(props.id, newName, newdueDate, newDesc); // Pass dueDate to editTask
      setNewName("");
      setNewDueDate("");
      setNewDesc("");
      setEditing(false);
      window.location.reload(); // Refresh the page
    } else {
      alert("Name field cannot be empty");
    }
  }



  const editingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="todo-label" htmlFor={props.id}>
          New name for {props.name}
        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newName}
          onChange={handleChange}
          ref={editFieldRef}
        />
        <label className="todo-label" htmlFor={`${props.id}-due-date`}>
          Due date
        </label>
        <input
          id={`${props.id}-due-date`}
          className="todo-text"
          type="date"
          value={newdueDate} // Set the value to dueDate
          onChange={handleDueDateChange}
        />
        <label className="todo-label" htmlFor={`${props.id}-desc`}>
          Description
        </label>
        <input
          id={`${props.id}-desc`}
          className="todo-text"
          type="text"
          value={newDesc}
          onChange={handleDescChange}
        />

      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn todo-cancel"
          onClick={() => setEditing(false)}>
          Cancel
          <span className="visually-hidden">renaming {props.name}</span>
        </button>
        <button type="submit" className="btn btn__primary todo-edit">
          Save
          <span className="visually-hidden">new name for {props.name}</span>
        </button>
      </div>
    </form>
  );

  




  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          id={props.id}
          type="checkbox"
          defaultChecked={props.completed}
          onChange={() => {
            props.toggleTaskCompleted(props.id);
            if (!props.completed) {
            
            }
          }}


        />
        <label className="todo-label" htmlFor={props.id}>
          <span id="task_name">{props.name}</span><br />
          {props.dueDate && `Due by: ${props.dueDate}`}<br />
          {props.desc} <br />
          &nbsp;| la {props.latitude} 
           &nbsp;| lo {props.longitude}
          {props.completed && completionDate && `completed on: ${completionDate}`}<br />

        </label>
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          onClick={() => {
            setEditing(true);
          }}
          ref={editButtonRef}>
          Edit <span className="visually-hidden">{props.name}</span>
        </button>

        <Popup // à 3
          trigger={
            <button type="button" className="btn">
              {" "}
              Take Photo{" "}
            </button>
          }
          modal
        >
          <div>
            <WebcamCapture id={props.id} photoedTask={props.photoedTask} />
          </div>
        </Popup>
        <Popup // à 4
          trigger={
            <button type="button" className="btn">
              {" "}
              View Photo{" "}
            </button>
          }
          modal
        >
          <div>
            <ViewPhoto id={props.id} alt={props.name} />
          </div>
        </Popup>

        <button
          type="button"
          className="btn btn__danger"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this record?")) {
              props.deleteTask(props.id);
            }
          }}>
          Delete <span className="visually-hidden">{props.name}</span>
        </button>


      </div>
    </div>
  );

  useEffect(() => {
    if (!wasEditing && isEditing) {
      editFieldRef.current.focus();
    } else if (wasEditing && !isEditing) {
      editButtonRef.current.focus();
    }
  }, [wasEditing, isEditing]);

  return <li className="todo">{isEditing ? editingTemplate : viewTemplate}</li>;
}

const WebcamCapture = (props) => {

  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgId, setImgId] = useState(null);
  const [photoSave, setPhotoSave] = useState(false);

  useEffect(() => {
    if (photoSave) {
      console.log("useEffect detected photoSave");
      props.photoedTask(imgId);
      setPhotoSave(false);
    }
  });
  console.log("WebCamCapture", props.id);


  const capture = useCallback((id) => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    console.log("capture", imageSrc.length, id);
  },
    [webcamRef, setImgSrc]
  );

  const savePhoto = (id, imgSrc) => {
    console.log("savePhoto", imgSrc.length, id);
    addPhoto(id, imgSrc);
    setImgId(id);
    setPhotoSave(true);
  };

  const cancelPhoto = (id, imgSrc) => {
    console.log("cancelPhoto", imgSrc.length, id);
  };

  return (
    <>
      {!imgSrc && ( // Before image capture show live picture from camera
        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
      )}
      {imgSrc && <img src={imgSrc} />} // After image capture show the static picture captured
      <div className="btn-group">
        {!imgSrc && ( // Before image capture show capture button &functionality
          <button
            type="button"
            className="btn"
            onClick={() => capture(props.id)}>
            Capture photo
          </button>
        )}
        {imgSrc && ( // After image capture show save button & functionality
          <button
            type="button"
            className="btn"
            onClick={() => savePhoto(props.id, imgSrc)}>
            Save Photo
          </button>
        )}
        <button // Cancel button not implemented but you could fix this.
          type="button"
          className="btn todo-cancel"
          onClick={() => cancelPhoto(props.id, imgSrc)}>
          Cancel
        </button>
      </div>
    </>);

};

const ViewPhoto = (props) => {

  const photoSrc = GetPhotoSrc(props.id);
  return (
    <>
      <div>

        <img src={photoSrc} alt={props.name} />
      </div>
    </>
  );
};

export default Todo;