import { Router } from "express";
import { registerUser } from "../controllers/user.Controller.js";
import {upload} from "../middlewares/multer.middleware.js";

const router=Router();

router.route('/register').post(
    upload.fields([
        {   
            name:"avatar",
            maxCount:1
        },
        {
            coverimage:"coverimage",
            maxCount:1
        }
    ]),    
    registerUser
);

export default router;