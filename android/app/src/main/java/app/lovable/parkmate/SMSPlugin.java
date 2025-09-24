package app.lovable.parkmate;

import android.Manifest;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.MainActivity;

public class SMSPlugin {
    private MainActivity activity;
    private static final int SMS_PERMISSION_REQUEST = 1001;

    public SMSPlugin(MainActivity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public String sendSMS(String phoneNumber, String message) {
        try {
            // Check for SMS permission
            if (ContextCompat.checkSelfPermission(activity, Manifest.permission.SEND_SMS) 
                != PackageManager.PERMISSION_GRANTED) {
                
                // Request permission
                ActivityCompat.requestPermissions(activity, 
                    new String[]{Manifest.permission.SEND_SMS}, 
                    SMS_PERMISSION_REQUEST);
                return "permission_denied";
            }

            // Send SMS
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, message, null, null);
            
            // Show success toast
            activity.runOnUiThread(() -> 
                Toast.makeText(activity, "SMS sent successfully", Toast.LENGTH_SHORT).show());
            
            return "success";
        } catch (Exception e) {
            // Show error toast
            activity.runOnUiThread(() -> 
                Toast.makeText(activity, "Failed to send SMS: " + e.getMessage(), Toast.LENGTH_LONG).show());
            
            return "error: " + e.getMessage();
        }
    }

    @JavascriptInterface
    public boolean hasSMSPermission() {
        return ContextCompat.checkSelfPermission(activity, Manifest.permission.SEND_SMS) 
               == PackageManager.PERMISSION_GRANTED;
    }
}