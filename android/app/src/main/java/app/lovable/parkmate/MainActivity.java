package app.lovable.parkmate;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private SMSPlugin smsPlugin;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize SMS plugin
        smsPlugin = new SMSPlugin(this);

        // Add JavaScript interface for SMS functionality
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(smsPlugin, "AndroidInterface");
    }
}