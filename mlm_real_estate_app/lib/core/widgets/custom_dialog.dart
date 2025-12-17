import 'package:flutter/material.dart';

/// Custom dialog widgets with various types
///
/// Supports:
/// - Alert dialog
/// - Confirmation dialog
/// - Success dialog
/// - Error dialog
/// - Loading dialog
/// - Custom content dialog
/// - Info dialog
class CustomDialog {
  /// Shows a basic alert dialog
  static Future<void> showAlert({
    required BuildContext context,
    required String message, String? title,
    String buttonText = 'OK',
    VoidCallback? onPressed,
  }) {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: title != null ? Text(title) : null,
        content: Text(message),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              onPressed?.call();
            },
            child: Text(buttonText),
          ),
        ],
      ),
    );
  }

  /// Shows a confirmation dialog
  static Future<bool?> showConfirmation({
    required BuildContext context,
    required String message, String? title,
    String confirmText = 'Confirm',
    String cancelText = 'Cancel',
    Color? confirmColor,
    bool isDanger = false,
    VoidCallback? onConfirm,
    VoidCallback? onCancel,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: title != null ? Text(title) : null,
        content: Text(message),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context, false);
              onCancel?.call();
            },
            child: Text(cancelText),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context, true);
              onConfirm?.call();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: confirmColor ??
                  (isDanger ? Colors.red : null),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
            ),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }

  /// Shows a success dialog
  static Future<void> showSuccess({
    required BuildContext context,
    required String message, String? title,
    String buttonText = 'OK',
    VoidCallback? onPressed,
    Duration? autoDismissDuration,
  }) {
    final dialog = showDialog(
      context: context,
      builder: (context) => _StatusDialog(
        type: DialogType.success,
        title: title ?? 'Success',
        message: message,
        buttonText: buttonText,
        onPressed: onPressed,
      ),
    );

    if (autoDismissDuration != null) {
      Future.delayed(autoDismissDuration, () {
        if (context.mounted) {
          Navigator.of(context, rootNavigator: true).pop();
        }
      });
    }

    return dialog;
  }

  /// Shows an error dialog
  static Future<void> showError({
    required BuildContext context,
    required String message, String? title,
    String buttonText = 'OK',
    VoidCallback? onPressed,
  }) {
    return showDialog(
      context: context,
      builder: (context) => _StatusDialog(
        type: DialogType.error,
        title: title ?? 'Error',
        message: message,
        buttonText: buttonText,
        onPressed: onPressed,
      ),
    );
  }

  /// Shows an info dialog
  static Future<void> showInfo({
    required BuildContext context,
    required String message, String? title,
    String buttonText = 'OK',
    VoidCallback? onPressed,
  }) {
    return showDialog(
      context: context,
      builder: (context) => _StatusDialog(
        type: DialogType.info,
        title: title ?? 'Information',
        message: message,
        buttonText: buttonText,
        onPressed: onPressed,
      ),
    );
  }

  /// Shows a warning dialog
  static Future<void> showWarning({
    required BuildContext context,
    required String message, String? title,
    String buttonText = 'OK',
    VoidCallback? onPressed,
  }) {
    return showDialog(
      context: context,
      builder: (context) => _StatusDialog(
        type: DialogType.warning,
        title: title ?? 'Warning',
        message: message,
        buttonText: buttonText,
        onPressed: onPressed,
      ),
    );
  }

  /// Shows a loading dialog
  static void showLoading({
    required BuildContext context,
    String? message,
    bool barrierDismissible = false,
  }) {
    showDialog(
      context: context,
      barrierDismissible: barrierDismissible,
      builder: (context) => WillPopScope(
        onWillPop: () async => barrierDismissible,
        child: Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const CircularProgressIndicator(),
                if (message != null) ...[
                  const SizedBox(height: 16.0),
                  Text(
                    message,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16.0),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Hides the loading dialog
  static void hideLoading(BuildContext context) {
    Navigator.of(context, rootNavigator: true).pop();
  }

  /// Shows a custom dialog with custom content
  static Future<T?> showCustom<T>({
    required BuildContext context,
    required Widget content, String? title,
    List<Widget>? actions,
    bool barrierDismissible = true,
    Color? backgroundColor,
    EdgeInsetsGeometry? contentPadding,
    EdgeInsetsGeometry? titlePadding,
  }) {
    return showDialog<T>(
      context: context,
      barrierDismissible: barrierDismissible,
      builder: (context) => AlertDialog(
        title: title != null ? Text(title) : null,
        content: content,
        actions: actions,
        backgroundColor: backgroundColor,
        contentPadding: contentPadding ??
            const EdgeInsets.fromLTRB(24.0, 20.0, 24.0, 24.0),
        titlePadding: titlePadding ??
            const EdgeInsets.fromLTRB(24.0, 24.0, 24.0, 0.0),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
      ),
    );
  }

  /// Shows an input dialog
  static Future<String?> showInput({
    required BuildContext context,
    String? title,
    String? message,
    String? hintText,
    String? initialValue,
    String confirmText = 'Submit',
    String cancelText = 'Cancel',
    TextInputType? keyboardType,
    int? maxLines,
    String? Function(String?)? validator,
  }) {
    final controller = TextEditingController(text: initialValue);
    final formKey = GlobalKey<FormState>();

    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: title != null ? Text(title) : null,
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (message != null) ...[
                Text(message),
                const SizedBox(height: 16.0),
              ],
              TextFormField(
                controller: controller,
                autofocus: true,
                keyboardType: keyboardType,
                maxLines: maxLines ?? 1,
                validator: validator,
                decoration: InputDecoration(
                  hintText: hintText,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
              ),
            ],
          ),
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(cancelText),
          ),
          ElevatedButton(
            onPressed: () {
              if (formKey.currentState?.validate() ?? false) {
                Navigator.pop(context, controller.text);
              }
            },
            style: ElevatedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.0),
              ),
            ),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }

  /// Shows a list selection dialog
  static Future<T?> showListSelection<T>({
    required BuildContext context,
    required List<DialogOption<T>> options, String? title,
    T? selectedValue,
  }) {
    return showDialog<T>(
      context: context,
      builder: (context) => AlertDialog(
        title: title != null ? Text(title) : null,
        contentPadding: const EdgeInsets.symmetric(vertical: 8.0),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: options.length,
            itemBuilder: (context, index) {
              final option = options[index];
              final isSelected = option.value == selectedValue;

              return ListTile(
                leading: option.icon != null ? Icon(option.icon) : null,
                title: Text(option.label),
                trailing: isSelected ? const Icon(Icons.check) : null,
                onTap: () => Navigator.pop(context, option.value),
              );
            },
          ),
        ),
      ),
    );
  }
}

/// Status dialog widget for success, error, info, and warning
class _StatusDialog extends StatelessWidget {
  final DialogType type;
  final String title;
  final String message;
  final String buttonText;
  final VoidCallback? onPressed;

  const _StatusDialog({
    required this.type,
    required this.title,
    required this.message,
    required this.buttonText,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getDialogConfig();

    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: config.color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                config.icon,
                size: 48.0,
                color: config.color,
              ),
            ),
            const SizedBox(height: 16.0),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20.0,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12.0),
            Text(
              message,
              style: TextStyle(
                fontSize: 14.0,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24.0),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  onPressed?.call();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: config.color,
                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                child: Text(buttonText),
              ),
            ),
          ],
        ),
      ),
    );
  }

  _DialogConfig _getDialogConfig() {
    switch (type) {
      case DialogType.success:
        return const _DialogConfig(
          icon: Icons.check_circle_outline,
          color: Colors.green,
        );
      case DialogType.error:
        return const _DialogConfig(
          icon: Icons.error_outline,
          color: Colors.red,
        );
      case DialogType.warning:
        return const _DialogConfig(
          icon: Icons.warning_amber_outlined,
          color: Colors.orange,
        );
      case DialogType.info:
        return const _DialogConfig(
          icon: Icons.info_outline,
          color: Colors.blue,
        );
    }
  }
}

/// Dialog type enumeration
enum DialogType {
  success,
  error,
  warning,
  info,
}

/// Dialog configuration
class _DialogConfig {
  final IconData icon;
  final Color color;

  const _DialogConfig({
    required this.icon,
    required this.color,
  });
}

/// Dialog option for list selection
class DialogOption<T> {
  final String label;
  final T value;
  final IconData? icon;

  const DialogOption({
    required this.label,
    required this.value,
    this.icon,
  });
}

/// Full screen dialog helper
class FullScreenDialog extends StatelessWidget {
  final String? title;
  final Widget child;
  final List<Widget>? actions;
  final Color? backgroundColor;

  const FullScreenDialog({
    required this.child, super.key,
    this.title,
    this.actions,
    this.backgroundColor,
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child, String? title,
    List<Widget>? actions,
    Color? backgroundColor,
  }) {
    return Navigator.push<T>(
      context,
      MaterialPageRoute(
        fullscreenDialog: true,
        builder: (context) => FullScreenDialog(
          title: title,
          actions: actions,
          backgroundColor: backgroundColor,
          child: child,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: title != null ? Text(title!) : null,
        actions: actions,
      ),
      body: child,
    );
  }
}
