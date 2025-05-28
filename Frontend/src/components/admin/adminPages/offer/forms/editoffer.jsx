import { useParams } from "react-router-dom";
import OfferForm from "../../../reuse/offerlist/offerform";

const EditOfferForm = () => {
  const { offerId } = useParams();
  return <OfferForm mode="edit" offerId={offerId} />;
};

export default EditOfferForm;
