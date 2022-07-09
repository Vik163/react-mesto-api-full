import Popup from "./Popup.js";
import popupSignOk from "./../images/ok.svg";
import popupSignNo from "./../images/no.svg";

function InfoTooltip(props) {
  const { text, isOpen, name, sign, onClose } = props;
  return (
    <Popup isOpen={isOpen} name={name} onClose={onClose}>
      <img
        className="popup__sign"
        src={sign ? popupSignOk : popupSignNo}
        alt={sign ? "Ok" : "No"}
      />

      <p className="popup__message">{text}</p>
    </Popup>
  );
}

export default InfoTooltip;
